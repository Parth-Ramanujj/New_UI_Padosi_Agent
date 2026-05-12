"""
PadosiAgent — Clients API URL Configuration
REST API endpoints for client operations.

Prefix: /api/clients/
"""

from django.urls import path
from . import api_views

app_name = 'clients_api'

urlpatterns = [
    path('quick-register/', api_views.QuickRegisterAPIView.as_view(), name='quick_register'),
]
