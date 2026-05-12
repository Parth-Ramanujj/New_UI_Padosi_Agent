"""
PadosiAgent — Accounts Middleware
Converted from 8 Laravel middleware files in app/Http/Middleware/

Each Laravel middleware class had a handle() method that receives
(Request, Closure $next). In Django, middleware uses __call__ or
process_request/process_response pattern.

Mapping:
  Laravel AdminMiddleware           → AdminRequiredMixin (decorator)
  Laravel RoleMiddleware            → role_required (decorator)
  Laravel RedirectIfAuthenticated   → redirect_if_authenticated (decorator)
  Laravel SecurityHeaders           → SecurityHeadersMiddleware (class)
  Laravel ThreatMonitorMiddleware   → ThreatMonitorMiddleware (class)
  Laravel AdminIpWhitelist          → admin_ip_whitelist (decorator)
  Laravel NoCacheHeaders            → NoCacheHeadersMiddleware (class)
  Laravel RestrictAgentAccess       → restrict_agent_access (decorator)
"""

import re
import json
import logging
from functools import wraps

from django.conf import settings
from django.http import HttpResponseForbidden, JsonResponse
from django.shortcuts import redirect
from django.urls import reverse
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger('apps.accounts')


# =============================================================================
# GLOBAL MIDDLEWARE (runs on every request)
# =============================================================================

class SecurityHeadersMiddleware(MiddlewareMixin):
    """
    Converted from: app/Http/Middleware/SecurityHeaders.php

    Adds hardened HTTP security response headers on every request
    to prevent fingerprinting, clickjacking, MIME-sniffing, and XSS.
    """

    def process_response(self, request, response):
        # F4: Remove technology fingerprinting headers
        response.headers.pop('X-Powered-By', None)
        response.headers.pop('Server', None)

        # Clickjacking protection
        response['X-Frame-Options'] = 'SAMEORIGIN'

        # MIME-sniffing protection
        response['X-Content-Type-Options'] = 'nosniff'

        # Referrer privacy
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'

        # XSS protection (legacy browsers)
        response['X-XSS-Protection'] = '1; mode=block'

        # Disable unused browser features
        response['Permissions-Policy'] = (
            'camera=(), microphone=(), geolocation=(self), payment=(self)'
        )

        # HSTS in production
        if not settings.DEBUG:
            response['Strict-Transport-Security'] = (
                'max-age=31536000; includeSubDomains; preload'
            )

        # Block Flash/PDF cross-domain policy files
        response['X-Permitted-Cross-Domain-Policies'] = 'none'

        # Content Security Policy (same as Laravel's CSP)
        response['Content-Security-Policy'] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' "
            "https://cdn.jsdelivr.net https://cdnjs.cloudflare.com "
            "https://checkout.razorpay.com https://api.razorpay.com "
            "https://connect.facebook.net https://www.googletagmanager.com "
            "https://www.google-analytics.com https://www.gstatic.com "
            "https://unpkg.com https://assets.calendly.com "
            "https://www.clarity.ms https://*.clarity.ms; "
            "style-src 'self' 'unsafe-inline' "
            "https://fonts.googleapis.com https://cdn.jsdelivr.net "
            "https://cdnjs.cloudflare.com https://unpkg.com "
            "https://assets.calendly.com; "
            "font-src 'self' data: "
            "https://fonts.gstatic.com https://cdnjs.cloudflare.com; "
            "img-src 'self' data: blob: "
            "https://www.facebook.com https://www.google-analytics.com "
            "https://*.clarity.ms https://c.clarity.ms; "
            "frame-src 'self' "
            "https://checkout.razorpay.com https://api.razorpay.com "
            "https://calendly.com; "
            "connect-src 'self' "
            "https://api.razorpay.com wss: ws: "
            "https://fcm.googleapis.com https://firebaseinstallations.googleapis.com "
            "https://www.google-analytics.com "
            "https://*.clarity.ms https://www.clarity.ms "
            "https://*.on.aws "
            "https://*.run.app; "
            "worker-src 'self' blob:; "
            "manifest-src 'self';"
        )

        return response


class NoCacheHeadersMiddleware(MiddlewareMixin):
    """
    Converted from: app/Http/Middleware/NoCacheHeaders.php

    Prevents browser from caching pages so the back button
    doesn't show stale content after login/logout.

    Usage: Apply to specific views that need no-cache behavior.
    """

    def process_response(self, request, response):
        response['Cache-Control'] = 'no-cache, no-store, max-age=0, must-revalidate'
        response['Pragma'] = 'no-cache'
        response['Expires'] = 'Sat, 01 Jan 2000 00:00:00 GMT'
        return response


class ThreatMonitorMiddleware(MiddlewareMixin):
    """
    Converted from: app/Http/Middleware/ThreatMonitorMiddleware.php

    WAF-like middleware that scans every request for malicious payloads
    (SQL injection, XSS, path traversal, RCE, SSRF, XXE, SSTI, CRLF).

    Features:
    - Whitelists localhost IPs
    - Checks if IP is blocked
    - Scans URL + POST body against attack patterns
    - Auto-bans IPs after 3 offenses in 1 hour
    - Logs threats to database
    - Sends security alert emails via Brevo API

    Note: The SecurityThreatLog and BlockedIp models will be added
    in the admin_panel module. For now, this middleware logs to file only.
    """

    # Hardened WAF patterns (same regex as Laravel)
    PATTERNS = {
        'SQL Injection': re.compile(
            r'(union select\s|select\s+\*\s+from|insert\s+into|update\s+\w+\s+set|'
            r"'\s*or\s*'1'\s*=\s*'1|sleep\(\d+\)|benchmark\s*\(|"
            r'group_concat|information_schema)', re.IGNORECASE
        ),
        'Cross Site Scripting (XSS)': re.compile(
            r'(<script\b[^>]*>|javascript:|onerror=|onload=|eval\(|'
            r'setTimeout\(|setInterval\(|alert\(|document\.cookie|'
            r'document\.domain|window\.location)', re.IGNORECASE
        ),
        'Path Traversal / LFI': re.compile(
            r'(\.\./|\.\.\\|/etc/passwd|/etc/shadow|/etc/group|'
            r'/etc/hosts|/proc/self|php://filter|php://input|'
            r'expect://)', re.IGNORECASE
        ),
        'RCE / Shell Injection': re.compile(
            r'(system\(|exec\(|passthru\(|shell_exec\(|proc_open\(|'
            r'pcntl_exec\(|python\s+-c|perl\s+-e|ruby\s+-e|bash\s+-i|'
            r'nc\s+-e)', re.IGNORECASE
        ),
        'SSRF / Metadata API': re.compile(
            r'(169\.254\.169\.254|metadata\.google\.internal|'
            r'/latest/meta-data/)', re.IGNORECASE
        ),
        'XML External Entity (XXE)': re.compile(
            r'(<!ENTITY\s+|SYSTEM\s+["\']|PUBLIC\s+["\'])', re.IGNORECASE
        ),
        'Server-Side Template Injection': re.compile(
            r'({{\s*[\s\S]*\s*}}|{%\s*[\s\S]*\s*%}|\[\[\s*[\s\S]*\s*\]\])',
            re.IGNORECASE
        ),
        'CRLF / Header Injection': re.compile(
            r'(%0d%0a|\r\n|Set-Cookie:|Content-Type:)', re.IGNORECASE
        ),
    }

    def process_request(self, request):
        ip = self._get_client_ip(request)

        # Whitelist localhost
        if ip in ('127.0.0.1', '::1'):
            return None

        # Check blocked IPs (will use DB model after admin_panel module is built)
        # For now, just log threats

        # Build scan input
        try:
            body = request.body.decode('utf-8', errors='ignore')
        except Exception:
            body = ''

        input_data = json.dumps(dict(request.GET)) + json.dumps(dict(request.POST)) + body
        url = request.build_absolute_uri()

        # Scan against WAF patterns
        for threat_type, pattern in self.PATTERNS.items():
            if pattern.search(input_data) or pattern.search(url):
                logger.warning(
                    f'THREAT DETECTED: {threat_type} | IP: {ip} | URL: {url} | '
                    f'User: {request.user if request.user.is_authenticated else "GUEST"}'
                )

                if request.headers.get('Accept', '').find('application/json') != -1:
                    return JsonResponse(
                        {'error': 'Malicious Activity Detected.'},
                        status=403
                    )
                return HttpResponseForbidden('Malicious activity detected.')

        return None

    @staticmethod
    def _get_client_ip(request):
        """Extract client IP from request (handles proxies)."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', '127.0.0.1')


# =============================================================================
# VIEW-LEVEL DECORATORS (applied per-view, not globally)
# These replace Laravel's route-level middleware assignments
# =============================================================================

def admin_required(view_func):
    """
    Converted from: app/Http/Middleware/AdminMiddleware.php

    Restricts access to admin users only.
    Checks if the user is authenticated via the 'admin' guard.

    In Django, we check if the user has role='admin'.
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect(reverse('accounts:agent_login'))

        if not hasattr(request.user, 'is_admin') or not request.user.is_admin():
            return redirect(reverse('accounts:agent_login'))

        return view_func(request, *args, **kwargs)
    return wrapper


def role_required(*allowed_roles):
    """
    Converted from: app/Http/Middleware/RoleMiddleware.php

    Restricts access to users with specific roles.
    Admin users always pass through (full access).

    Usage: @role_required('agent') or @role_required('agent', 'client')
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                first_role = allowed_roles[0] if allowed_roles else 'agent'
                login_route = 'accounts:client_login' if first_role == 'client' else 'accounts:agent_login'
                return redirect(reverse(login_route))

            user = request.user

            # Admin has full access
            if user.role == 'admin':
                return view_func(request, *args, **kwargs)

            # Check if user's role is in allowed roles
            if user.role not in allowed_roles:
                return redirect(user.get_dashboard_url())

            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


def redirect_if_authenticated(view_func):
    """
    Converted from: app/Http/Middleware/RedirectIfAuthenticated.php

    Redirects already-authenticated users away from login/registration pages
    to their role-appropriate dashboard.
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect(request.user.get_dashboard_url())
        return view_func(request, *args, **kwargs)
    return wrapper


def admin_ip_whitelist(view_func):
    """
    Converted from: app/Http/Middleware/AdminIpWhitelist.php

    Restricts admin panel access to whitelisted IPs only.
    IPs are configured via ADMIN_WHITELIST_IPS in settings (from .env).
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        client_ip = ThreatMonitorMiddleware._get_client_ip(request)
        allowed_ips = getattr(settings, 'ADMIN_WHITELIST_IPS', [])

        if allowed_ips and client_ip not in allowed_ips:
            logger.warning(
                f'Admin access blocked: unauthorized IP {client_ip} '
                f'tried to access {request.get_full_path()}'
            )
            return HttpResponseForbidden('Access denied.')

        return view_func(request, *args, **kwargs)
    return wrapper


def restrict_agent_access(view_func):
    """
    Converted from: app/Http/Middleware/RestrictAgentAccess.php

    Agents can ONLY access their dashboard and profile pages.
    If a logged-in agent tries to access any other page (e.g., homepage),
    redirect them to their agent dashboard.
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if request.user.is_authenticated and request.user.role == 'agent':
            return redirect(reverse('agents:dashboard'))
        return view_func(request, *args, **kwargs)
    return wrapper
