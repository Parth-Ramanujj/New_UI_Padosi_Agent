"""
PadosiAgent — Accounts API URL Configuration
NEW: REST API endpoints for authentication.

These endpoints return JSON responses (not HTML pages).
Prefix: /api/accounts/
"""

from django.urls import path
from . import api_views

urlpatterns = [
    path('login/', api_views.LoginAPIView.as_view(), name='api_login'),
    path('logout/', api_views.LogoutAPIView.as_view(), name='api_logout'),
    path('me/', api_views.CurrentUserAPIView.as_view(), name='api_current_user'),
    path('forgot-password/', api_views.PasswordResetRequestAPIView.as_view(), name='api_forgot_password'),
    path('reset-password/', api_views.PasswordResetAPIView.as_view(), name='api_reset_password'),
]
