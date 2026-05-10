"""
PadosiAgent — Root URL Configuration
Converted from Laravel's routes/web.php

This is the Django equivalent of Laravel's RouteServiceProvider.
All app-specific URLs are included via include().
"""

from django.contrib import admin
from django.urls import path, include

# Configure Admin Dashboard Titles
admin.site.site_header = "Padosi Agent Admin"
admin.site.site_title = "Admin Portal"
admin.site.index_title = "Welcome to the Padosi Agent Admin Panel"

urlpatterns = [
    # Django admin
    path('admin/', admin.site.urls),

    # Accounts — Auth routes (login, logout, password reset)
    # Maps to Laravel's auth routes in web.php
    path('', include('apps.accounts.urls')),

    # API endpoints
    path('api/accounts/', include('apps.accounts.api_urls')),

    # Frontend routes
    path('', include('apps.frontend.urls')),
    path('client/', include('apps.clients.urls')),

    # Future modules will be added here:
    path('agent/', include('apps.agents.urls')),
    path('api/agents/', include('apps.agents.api_urls')),
    
    # Custom Laravel-ported Admin Panel
    path('admin-dashboard/', include('admin_panel.urls')),
]
