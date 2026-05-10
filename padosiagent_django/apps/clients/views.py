import logging
import re
from urllib.parse import urlparse, urlencode, parse_qs
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import login
from django.contrib.auth.hashers import make_password
from django.core.mail import send_mail
from django.db import transaction
from django.utils import timezone

from apps.accounts.models import User
from apps.clients.models import Client

logger = logging.getLogger('apps')

def sanitize_text(value: str) -> str:
    from django.utils.html import strip_tags
    value = strip_tags(value)
    value = re.sub(r'\s+', ' ', value)
    return value.strip()

def build_safe_redirect_url(request, pincode: str) -> str:
    redirect_input = request.POST.get('redirect_url', '')
    safe_path = None

    if redirect_input:
        decoded = redirect_input.strip()
        is_relative = decoded.startswith('/')
        is_protocol = decoded.startswith('//')
        has_proto = bool(re.match(r'[a-zA-Z][a-zA-Z0-9+\-.]*:', decoded))

        if is_relative and not is_protocol and not has_proto:
            parsed = urlparse(decoded)
            path_only = parsed.path or '/find-agents/'
            query_params = parse_qs(parsed.query)

            # Sanitize keys and values
            sanitized_params = {}
            for key, values in query_params.items():
                s_key = sanitize_text(key)
                if s_key:
                    s_vals = [sanitize_text(v) for v in values if sanitize_text(v)]
                    if s_vals:
                        sanitized_params[s_key] = s_vals

            # Inject missing pincode if applicable
            if pincode and 'pincode' not in sanitized_params and 'location' not in sanitized_params and 'lat' not in sanitized_params:
                sanitized_params['pincode'] = [pincode]

            query_string = urlencode(sanitized_params, doseq=True)
            safe_path = f"{path_only}?{query_string}" if query_string else path_only

    if not safe_path:
        safe_path = '/find-agents/'
        if pincode:
            safe_path += f'?pincode={pincode}'

    return safe_path

@csrf_exempt
def quick_register(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Invalid request method'}, status=405)
        
    fullname = request.POST.get('fullname', '')
    email = request.POST.get('email', '')
    mobile = request.POST.get('mobile', '')
    pincode = request.POST.get('pincode', '')

    errors = {}
    
    # Validation
    if not fullname or not re.match(r'^[\w\s.\-\']+$', fullname, re.UNICODE) or len(fullname) < 2 or len(fullname) > 100:
        errors['fullname'] = ['Name may only contain letters, spaces, dots, hyphens or apostrophes.']
    
    if not email or '@' not in email:
        errors['email'] = ['Please enter a valid email address.']
        
    if not mobile or not re.match(r'^[6-9][0-9]{9}$', mobile):
        errors['mobile'] = ['Please enter a valid Indian mobile number (starts with 6-9).']
        
    if pincode and (not pincode.isdigit() or len(pincode) != 6):
        errors['pincode'] = ['Pincode must be exactly 6 digits.']

    if errors:
        return JsonResponse({
            'success': False,
            'message': 'Please fix the validation errors below.',
            'errors': errors
        }, status=422)

    # Sanitize inputs
    fullname = sanitize_text(fullname)
    email = email.strip()
    mobile = re.sub(r'\D', '', mobile)
    pincode = re.sub(r'\D', '', pincode) if pincode else None

    # Check for existing client account
    existing_user = User.objects.filter(email=email, role='client').first()
    if existing_user:
        request.session['quick_lead_user'] = {
            'fullname': fullname,
            'email': email,
            'mobile': mobile,
            'pincode': pincode,
        }
        
        # Login
        existing_user.backend = 'django.contrib.auth.backends.ModelBackend'
        login(request, existing_user)

        return JsonResponse({
            'success': True,
            'status': 'success',
            'message': 'Welcome back! Redirecting...',
            'redirect': build_safe_redirect_url(request, pincode),
        })

    # Block email already used by a non-client account
    any_user = User.objects.filter(email=email).first()
    if any_user and any_user.role != 'client':
        return JsonResponse({
            'success': False,
            'message': 'This email is already associated with an existing account. Please use a different email or login to your account.'
        }, status=422)

    try:
        with transaction.atomic():
            user = User.objects.create(
                fullname=fullname,
                email=email,
                password=make_password(email),
                role='client',
                status='active',
                email_verified_at=timezone.now() if hasattr(User, 'email_verified_at') else None
            )

            Client.objects.create(
                user=user,
                mobile=mobile,
                pincode=pincode
            )

        # Non-blocking email sending skipped here for simplicity but logged
        logger.info(f"Client registered: {user.id}")

        request.session['quick_lead_user'] = {
            'fullname': fullname,
            'email': email,
            'mobile': mobile,
            'pincode': pincode,
        }

        user.backend = 'django.contrib.auth.backends.ModelBackend'
        login(request, user)

        return JsonResponse({
            'success': True,
            'status': 'success',
            'message': 'Registration successful! Redirecting...',
            'redirect': build_safe_redirect_url(request, pincode),
        })

    except Exception as e:
        logger.error(f'Quick register failed: {str(e)}')
        return JsonResponse({
            'success': False,
            'status': 'error',
            'message': 'Unable to complete registration right now. Please try again.'
        }, status=500)
