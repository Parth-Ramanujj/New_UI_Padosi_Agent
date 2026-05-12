"""
PadosiAgent — Accounts Forms
Converted from Laravel's inline validation in AuthController.php

In Laravel, validation is done inside the controller:
    $request->validate(['email' => 'required|email', ...])

In Django, we use Form classes for the same purpose.
"""

from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import SetPasswordForm

User = get_user_model()


class LoginForm(forms.Form):
    """
    Converted from: AuthController::login() validation rules.

    Laravel validation:
        'email'    => ['required', 'email'],
        'password' => ['required', 'string', 'min:8'],
    """
    email = forms.EmailField(
        widget=forms.EmailInput(attrs={
            'id': 'email',
            'placeholder': 'Enter your email or username',
            'required': True,
            'autofocus': True,
        })
    )
    password = forms.CharField(
        min_length=8,
        widget=forms.PasswordInput(attrs={
            'id': 'password',
            'placeholder': '••••••••',
            'required': True,
        })
    )
    login_type = forms.CharField(
        widget=forms.HiddenInput(),
        required=False,
    )
    remember = forms.BooleanField(required=False)


class ForgotPasswordForm(forms.Form):
    """
    Converted from: AuthController::sendResetLinkEmail() validation.

    Laravel validation:
        'email'      => 'required|email',
        'login_type' => 'required|in:agent,client',
    """
    email = forms.EmailField(
        widget=forms.EmailInput(attrs={
            'id': 'email',
            'placeholder': 'Enter your email',
            'required': True,
            'autofocus': True,
        })
    )
    login_type = forms.ChoiceField(
        choices=[('agent', 'Agent'), ('client', 'Client')],
        widget=forms.HiddenInput(),
    )


class ResetPasswordForm(SetPasswordForm):
    """
    Converted from: AuthController::reset() validation.

    Laravel validation:
        'token'      => 'required',
        'email'      => 'required|email',
        'password'   => ['required', 'confirmed', 'min:8',
                         Password::min(8)->letters()->mixedCase()->numbers()->symbols()],
        'login_type' => 'required|in:agent,client',

    Django's SetPasswordForm already handles password + confirmation.
    We add the token, email, and login_type fields.
    """
    login_type = forms.ChoiceField(
        choices=[('agent', 'Agent'), ('client', 'Client')],
        widget=forms.HiddenInput(),
    )
