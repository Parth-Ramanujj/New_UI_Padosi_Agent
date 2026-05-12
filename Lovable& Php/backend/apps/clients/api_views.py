"""
PadosiAgent — Clients API Views (DRF)
REST API endpoints for client operations.
"""

import re
import logging
from django.contrib.auth import login
from django.contrib.auth.hashers import make_password
from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import User
from apps.accounts.serializers import UserSerializer
from apps.clients.models import Client

logger = logging.getLogger('apps')


class QuickRegisterAPIView(APIView):
    """
    POST /api/clients/quick-register/

    Quick client registration from the frontend.
    Accepts JSON:
    {
        "fullname": "...",
        "email": "...",
        "mobile": "...",
        "pincode": "..."  // optional
    }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        fullname = data.get('fullname', '').strip()
        email = data.get('email', '').strip().lower()
        mobile = data.get('mobile', '').strip()
        pincode = data.get('pincode', '').strip()

        # Validation
        errors = {}
        if not fullname or len(fullname) < 2:
            errors['fullname'] = ['Name is required (at least 2 characters).']
        if not email or '@' not in email:
            errors['email'] = ['A valid email is required.']
        if not mobile or not re.match(r'^[6-9][0-9]{9}$', mobile):
            errors['mobile'] = ['Please enter a valid Indian mobile number.']
        if pincode and (not pincode.isdigit() or len(pincode) != 6):
            errors['pincode'] = ['Pincode must be exactly 6 digits.']

        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        # Check existing client
        existing_user = User.objects.filter(email=email, role='client').first()
        if existing_user:
            existing_user.backend = 'django.contrib.auth.backends.ModelBackend'
            login(request, existing_user)
            return Response({
                'message': 'Welcome back!',
                'user': UserSerializer(existing_user).data,
            })

        # Block email used by non-client
        any_user = User.objects.filter(email=email).first()
        if any_user and any_user.role != 'client':
            return Response(
                {'error': 'This email is already associated with a different account type.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                user = User.objects.create(
                    fullname=fullname,
                    email=email,
                    password=make_password(email),
                    role='client',
                    status='active',
                    email_verified_at=timezone.now(),
                )
                Client.objects.create(
                    user=user,
                    mobile=mobile,
                    pincode=pincode,
                )

            user.backend = 'django.contrib.auth.backends.ModelBackend'
            login(request, user)

            return Response({
                'message': 'Registration successful!',
                'user': UserSerializer(user).data,
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f'Quick register API failed: {e}')
            return Response(
                {'error': 'Registration failed. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
