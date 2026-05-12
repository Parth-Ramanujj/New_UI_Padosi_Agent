"""
PadosiAgent — Root URL Configuration
Combined Django REST API backend + React SPA frontend.

API routes:       /api/...    → Django REST Framework views
Admin routes:     /admin/     → Django admin
SPA catch-all:    /*          → React SPA index.html (served last)
"""

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static

from config.spa_views import serve_react_app, csrf_token_view

# Configure Admin Dashboard Titles
admin.site.site_header = "Padosi Agent Admin"
admin.site.site_title = "Admin Portal"
admin.site.index_title = "Welcome to the Padosi Agent Admin Panel"

urlpatterns = [
    # ── Django admin ─────────────────────────────────────────────────────
    path('admin/', admin.site.urls),

    # ── Custom admin panel (Laravel-ported) ──────────────────────────────
    path('admin-dashboard/', include('admin_panel.urls')),

    # ── API endpoints ────────────────────────────────────────────────────
    # CSRF token for the React SPA
    path('api/csrf/', csrf_token_view, name='api_csrf'),

    # Authentication & user management
    path('api/accounts/', include('apps.accounts.api_urls')),

    # Agent operations (search, dashboard, leads, etc.)
    path('api/agents/', include('apps.agents.api_urls')),

    # Client operations
    path('api/clients/', include('apps.clients.api_urls')),

    # ── Legacy web routes (kept for backward compat / admin use) ─────────
    path('agent/', include('apps.agents.urls')),
    path('client/', include('apps.clients.urls')),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# ── React SPA catch-all (must be LAST) ───────────────────────────────────
# This serves the React index.html for any route not matched above.
# React Router handles all client-side routing (/login, /agents, etc.)
urlpatterns += [
    re_path(r'^(?!api/|admin/|admin-dashboard/|static/|media/).*$', serve_react_app, name='spa'),
]
