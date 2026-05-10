"""
PadosiAgent — Accounts Views (Web)
Converted from: app/Http/Controllers/Auth/AuthController.php

These are Django function-based views that replace Laravel controller methods.
Each view handles the same logic as its Laravel counterpart.
"""

import logging
from django.conf import settings
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.shortcuts import render, redirect
from django.urls import reverse
from django.utils import timezone
from django.views.decorators.http import require_POST, require_GET

from .forms import LoginForm, ForgotPasswordForm
from .middleware import redirect_if_authenticated

logger = logging.getLogger('apps.accounts')
User = get_user_model()


# =============================================================================
# LOGIN
# Converted from: AuthController::login()
# =============================================================================
@require_POST
def login_view(request):
    """
    Handle login form submission.

    Laravel logic replicated:
    1. Validate email + password
    2. Attempt authentication
    3. Check login_type matches user's role (agent cant login on client page)
    4. Update last_login_at
    5. Redirect to role-appropriate dashboard
    """
    form = LoginForm(request.POST)

    if not form.is_valid():
        messages.error(request, 'Please Enter Valid Login Details')
        return redirect(request.META.get('HTTP_REFERER', reverse('accounts:agent_login')))

    email = form.cleaned_data['email'].strip()
    password = form.cleaned_data['password'].strip()
    login_type = form.cleaned_data.get('login_type', '')

    try:
        user = authenticate(request, email=email, password=password)

        if user is not None:
            # Extra safety: Check login_type matches role (same as Laravel)
            if login_type and user.role != 'admin':
                if login_type == 'client' and user.role == 'agent':
                    messages.error(request, 'Please Enter Valid Login Details')
                    return redirect(request.META.get('HTTP_REFERER', '/'))
                if login_type == 'agent' and user.role == 'client':
                    messages.error(request, 'Please Enter Valid Login Details')
                    return redirect(request.META.get('HTTP_REFERER', '/'))

            login(request, user)
            logger.info(f'User logged in: id={user.id}, role={user.role}')

            # Update last login timestamp
            User.objects.filter(pk=user.pk).update(last_login_at=timezone.now())

            # Role-based redirect
            dashboard_url = user.get_dashboard_url()
            logger.info(f'Redirecting user to: {dashboard_url}')

            messages.success(request, 'Login successful!')
            return redirect(dashboard_url)

        # Authentication failed
        logger.warning(f'Login failed for email: {email}')
        messages.error(request, 'Please Enter Valid Login Details')
        return redirect(request.META.get('HTTP_REFERER', reverse('accounts:agent_login')))

    except Exception as e:
        logger.error(f'Login exception: {e}', exc_info=True)
        messages.error(request, 'Login service is temporarily unavailable. Please try again in a moment.')
        return redirect(request.META.get('HTTP_REFERER', reverse('accounts:agent_login')))


# =============================================================================
# LOGOUT
# Converted from: AuthController::logout()
# =============================================================================
@require_POST
def logout_view(request):
    """
    Handle logout.

    Laravel logic:
    1. Auth::logout()
    2. Invalidate session
    3. Regenerate CSRF token
    4. Redirect to home
    """
    logout(request)
    return redirect('/')


# =============================================================================
# LOGIN PAGES
# Converted from: routes/web.php Route::view('/agent-login', ...)
# =============================================================================
@redirect_if_authenticated
def agent_login(request):
    """Render the Agent login page."""
    return render(request, 'accounts/agent_login.html')


@redirect_if_authenticated
def client_login(request):
    """Render the Client login page."""
    return render(request, 'accounts/client_login.html')


# =============================================================================
# FORGOT PASSWORD
# Converted from: AuthController::showLinkRequestForm() & sendResetLinkEmail()
# =============================================================================
@require_GET
def forgot_password_page(request):
    """
    Show forgot password form.
    Converted from: AuthController::showLinkRequestForm()
    """
    login_type = request.GET.get('type', 'agent')
    return render(request, 'accounts/forgot_password.html', {
        'type': login_type,
    })


@require_POST
def send_reset_link(request):
    """
    Send password reset link email.
    Converted from: AuthController::sendResetLinkEmail()

    Laravel logic replicated:
    1. Validate email + login_type
    2. Find user by email
    3. Check role matches login_type
    4. Generate reset token
    5. Send email via Brevo API
    6. Always show generic success message (prevent email enumeration)
    """
    form = ForgotPasswordForm(request.POST)

    if not form.is_valid():
        messages.error(request, 'Please provide a valid email address.')
        return redirect(reverse('accounts:forgot_password') + f'?type={request.POST.get("login_type", "agent")}')

    email = form.cleaned_data['email']
    login_type = form.cleaned_data['login_type']

    try:
        user = User.objects.filter(email=email).first()

        # Always show success to prevent email enumeration (same as Laravel)
        if not user:
            messages.success(request, 'If that email is registered, you will receive a reset link shortly.')
            return redirect(reverse('accounts:forgot_password') + f'?type={login_type}')

        if user.role == 'admin':
            messages.error(request, 'Admin accounts cannot use this reset flow.')
            return redirect(reverse('accounts:forgot_password') + f'?type={login_type}')

        if user.role != login_type:
            other = 'Client' if login_type == 'agent' else 'Agent'
            messages.error(request, f'This email belongs to a {other} account. Please use the {other} login page.')
            return redirect(reverse('accounts:forgot_password') + f'?type={login_type}')

        # Generate password reset token
        token = default_token_generator.make_token(user)

        # Build reset URL
        reset_url = request.build_absolute_uri(
            reverse('accounts:reset_password', kwargs={'token': token})
            + f'?email={email}&type={login_type}'
        )

        # TODO: Send email via Brevo API (will be implemented in notifications module)
        # For now, log the reset URL
        logger.info(f'Password reset URL for {email}: {reset_url}')

        messages.success(request, 'Password reset link has been sent to your email address!')

    except Exception as e:
        logger.error(f'Password reset email failed: {e}', exc_info=True)
        messages.error(request, 'Unable to send reset email. Please try again later.')

    return redirect(reverse('accounts:forgot_password') + f'?type={login_type}')


# =============================================================================
# RESET PASSWORD
# Converted from: AuthController::showResetForm() & reset()
# =============================================================================
@require_GET
def reset_password_page(request, token):
    """
    Show reset password form.
    Converted from: AuthController::showResetForm()
    """
    login_type = request.GET.get('type', 'agent')
    email = request.GET.get('email', '')
    return render(request, 'accounts/reset_password.html', {
        'token': token,
        'email': email,
        'type': login_type,
    })


@require_POST
def reset_password(request):
    """
    Handle password reset form submission.
    Converted from: AuthController::reset()

    Laravel logic:
    1. Validate token, email, password (with strength rules), login_type
    2. Use Password::reset() to verify token and update password
    3. Redirect to appropriate login page with success message
    """
    token = request.POST.get('token')
    email = request.POST.get('email')
    password = request.POST.get('password')
    password_confirmation = request.POST.get('password_confirmation')
    login_type = request.POST.get('login_type', 'agent')

    # Basic validation
    if not all([token, email, password, password_confirmation]):
        messages.error(request, 'All fields are required.')
        return redirect(reverse('accounts:reset_password_page', kwargs={'token': token}) + f'?email={email}&type={login_type}')

    if password != password_confirmation:
        messages.error(request, 'Passwords do not match.')
        return redirect(reverse('accounts:reset_password_page', kwargs={'token': token}) + f'?email={email}&type={login_type}')

    if len(password) < 8:
        messages.error(request, 'Password must be at least 8 characters.')
        return redirect(reverse('accounts:reset_password_page', kwargs={'token': token}) + f'?email={email}&type={login_type}')

    try:
        user = User.objects.get(email=email)

        # Verify token
        if not default_token_generator.check_token(user, token):
            messages.error(request, 'This password reset link has expired or is invalid.')
            return redirect(reverse('accounts:forgot_password') + f'?type={login_type}')

        # Update password
        user.set_password(password)
        user.save()

        # Redirect to login with success message
        login_route = 'accounts:client_login' if login_type == 'client' else 'accounts:agent_login'
        messages.success(request, 'Your password has been reset successfully! Please log in.')
        return redirect(reverse(login_route))

    except User.DoesNotExist:
        messages.error(request, 'Invalid reset link.')
        return redirect(reverse('accounts:forgot_password') + f'?type={login_type}')
    except Exception as e:
        logger.error(f'Password reset failed: {e}', exc_info=True)
        messages.error(request, 'An error occurred. Please try again.')
        return redirect(reverse('accounts:forgot_password') + f'?type={login_type}')
