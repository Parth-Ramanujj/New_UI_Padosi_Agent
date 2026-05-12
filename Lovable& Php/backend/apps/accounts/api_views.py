"""
PadosiAgent — Accounts API Views (DRF)
REST API endpoints for authentication.

Includes:
- LoginAPIView
- LogoutAPIView
- RegisterAPIView (NEW)
- CurrentUserAPIView
- PasswordResetRequestAPIView
- PasswordResetAPIView
"""

import logging
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from django.db import transaction
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    LoginSerializer,
    UserSerializer,
    PasswordResetRequestSerializer,
    PasswordResetSerializer,
)

logger = logging.getLogger('apps.accounts')
User = get_user_model()


class LoginAPIView(APIView):
    """
    POST /api/accounts/login/

    API version of the web login view.
    Accepts JSON: {"email": "...", "password": "...", "login_type": "agent|client"}
    Returns user data on success.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        login_type = serializer.validated_data.get('login_type', 'agent')

        user = authenticate(request, email=email, password=password)

        if user is None:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Role validation (same as web view)
        if login_type and user.role != 'admin':
            if (login_type == 'client' and user.role == 'agent') or \
               (login_type == 'agent' and user.role == 'client'):
                return Response(
                    {'error': 'Please use the correct login page for your account type'},
                    status=status.HTTP_403_FORBIDDEN
                )

        login(request, user)
        User.objects.filter(pk=user.pk).update(last_login_at=timezone.now())

        return Response({
            'message': 'Login successful',
            'user': UserSerializer(user).data,
            'dashboard_url': user.get_dashboard_url(),
        })


class LogoutAPIView(APIView):
    """
    POST /api/accounts/logout/

    Logs out the current user and destroys the session.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({'message': 'Logged out successfully'})


class RegisterAPIView(APIView):
    """
    POST /api/accounts/register/

    Register a new user (agent, client, or distributor).
    Accepts JSON:
    {
        "fullname": "...",
        "email": "...",
        "password": "...",
        "role": "agent|client|distributor",
        "phone": "...",           // optional
        "company_name": "...",    // optional, for agents
    }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        fullname = data.get('fullname', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        role = data.get('role', 'client')
        phone = data.get('phone', '').strip()

        # Validation
        errors = {}
        if not fullname or len(fullname) < 2:
            errors['fullname'] = ['Name is required (at least 2 characters).']
        if not email or '@' not in email:
            errors['email'] = ['A valid email is required.']
        if not password or len(password) < 8:
            errors['password'] = ['Password must be at least 8 characters.']
        if role not in ('agent', 'client', 'distributor'):
            errors['role'] = ['Role must be agent, client, or distributor.']

        if User.objects.filter(email=email).exists():
            errors['email'] = ['An account with this email already exists.']

        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                # Map distributor to agent for now (distributor is a sub-type)
                db_role = 'agent' if role == 'distributor' else role

                user = User.objects.create(
                    fullname=fullname,
                    email=email,
                    password=make_password(password),
                    role=db_role,
                    status='active',
                    email_verified_at=timezone.now(),
                )

                # If agent, create Agent record
                if db_role == 'agent':
                    from apps.agents.models import Agent, AgentProfile
                    agent = Agent.objects.create(
                        user=user,
                        fullname=fullname,
                        email=email,
                        mobile=phone,
                        status='incomplete',
                        registration_step=0,
                    )
                    AgentProfile.objects.create(
                        agent=agent,
                        display_name=fullname,
                    )

                # If client, create Client record
                if db_role == 'client':
                    from apps.clients.models import Client
                    Client.objects.create(
                        user=user,
                        mobile=phone,
                    )

            # Log user in immediately
            user.backend = 'django.contrib.auth.backends.ModelBackend'
            login(request, user)

            return Response({
                'message': 'Registration successful',
                'user': UserSerializer(user).data,
                'dashboard_url': user.get_dashboard_url(),
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f'Registration error: {e}', exc_info=True)
            return Response(
                {'error': 'Registration failed. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CurrentUserAPIView(APIView):
    """
    GET /api/accounts/me/

    Returns the currently authenticated user's profile.
    Equivalent to Laravel's Auth::user().
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class PasswordResetRequestAPIView(APIView):
    """
    POST /api/accounts/forgot-password/

    API version of the forgot password flow.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        login_type = serializer.validated_data['login_type']

        # Always return success to prevent email enumeration
        user = User.objects.filter(email=email).first()

        if user and user.role != 'admin' and user.role == login_type:
            token = default_token_generator.make_token(user)
            reset_url = request.build_absolute_uri(
                f'/reset-password/{token}/?email={email}&type={login_type}'
            )
            # TODO: Send via Brevo API
            logger.info(f'Password reset URL for {email}: {reset_url}')

        return Response({
            'message': 'If that email is registered, you will receive a reset link shortly.'
        })


class PasswordResetAPIView(APIView):
    """
    POST /api/accounts/reset-password/

    API version of the password reset flow.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        token = serializer.validated_data['token']
        password = serializer.validated_data['password']

        try:
            user = User.objects.get(email=email)

            if not default_token_generator.check_token(user, token):
                return Response(
                    {'error': 'Invalid or expired reset token'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user.set_password(password)
            user.save()

            return Response({
                'message': 'Password has been reset successfully. Please log in.'
            })

        except User.DoesNotExist:
            return Response(
                {'error': 'Invalid reset link'},
                status=status.HTTP_400_BAD_REQUEST
            )
