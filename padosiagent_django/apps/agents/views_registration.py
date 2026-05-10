"""
PadosiAgent — Agent Registration Views (Module 2)
Converted from AgentRegistrationController.php (2500 lines)
"""
import hashlib
import hmac
import json
import logging
import random
import time

from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.db import transaction
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render, redirect
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from apps.accounts.models import User
from .models import (
    Agent, AgentProfile, AgentSubscription, AgentLeadPreference,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_site_setting(key, default=None):
    """Read from site_settings table (same as SiteSetting::getValue)."""
    try:
        from django.db import connection
        with connection.cursor() as c:
            c.execute("SELECT `value` FROM site_settings WHERE `key`=%s LIMIT 1", [key])
            row = c.fetchone()
            if row:
                return json.loads(row[0]) if row[0] else default
    except Exception:
        pass
    return default


def _send_otp_via_brevo(email, otp):
    """Send OTP email using Brevo HTTP API."""
    import requests as http_req
    api_key = getattr(settings, 'BREVO_API_KEY', '')
    if not api_key:
        logger.warning("BREVO_API_KEY not configured")
        return False
    html = (
        f'<div style="font-family:Arial;padding:20px">'
        f'<h2>PadosiAgent Email Verification</h2>'
        f'<p>Your OTP is: <strong style="font-size:24px;color:#2563eb">{otp}</strong></p>'
        f'<p>Valid for 10 minutes.</p></div>'
    )
    payload = {
        'sender': {'name': 'PadosiAgent', 'email': 'noreply@padosiagent.com'},
        'to': [{'email': email}],
        'subject': f'PadosiAgent - Email Verification OTP: {otp}',
        'htmlContent': html,
    }
    try:
        resp = http_req.post(
            'https://api.brevo.com/v3/smtp/email',
            json=payload,
            headers={'api-key': api_key, 'Content-Type': 'application/json'},
            timeout=15,
        )
        return resp.status_code < 300
    except Exception as e:
        logger.error(f"Brevo OTP send failed: {e}")
        return False


def _send_credentials_via_brevo(agent, password):
    """Send welcome credentials email using Brevo."""
    import requests as http_req
    api_key = getattr(settings, 'BREVO_API_KEY', '')
    if not api_key:
        return
    html = (
        f'<h2>Welcome to PadosiAgent!</h2>'
        f'<p>Your login credentials:</p>'
        f'<p>Email: {agent.email}<br>Password: {password}</p>'
    )
    try:
        http_req.post(
            'https://api.brevo.com/v3/smtp/email',
            json={
                'sender': {'name': 'PadosiAgent', 'email': 'noreply@padosiagent.com'},
                'to': [{'email': agent.email}],
                'subject': 'Welcome to PadosiAgent - Your Account Credentials',
                'htmlContent': html,
            },
            headers={'api-key': api_key, 'Content-Type': 'application/json'},
            timeout=15,
        )
    except Exception as e:
        logger.error(f"Credentials email failed: {e}")


# ---------------------------------------------------------------------------
# Registration Page
# ---------------------------------------------------------------------------
def register_page(request):
    """Render the multi-step registration page."""
    return render(request, 'agents/registration.html')


# ---------------------------------------------------------------------------
# Step 1: OTP + basic info
# ---------------------------------------------------------------------------
@csrf_exempt
@require_POST
def register_step1(request):
    """Validate email, send OTP, create draft Agent record."""
    try:
        email = (request.POST.get('email') or '').strip().lower()
        fullname = (request.POST.get('fullname') or '').strip()
        mobile = (request.POST.get('mobile') or '').strip()

        if not email or not fullname or not mobile:
            return JsonResponse({'success': False, 'message': 'All fields are required.'}, status=422)

        # Check existing completed agent
        existing = Agent.objects.filter(email=email).exclude(
            status__in=['incomplete', 'pending_otp']
        ).first()
        if existing:
            return JsonResponse({'success': False, 'message': 'Email already registered.'}, status=422)

        # Generate 6-digit OTP
        otp = str(random.randint(100000, 999999))

        # Create or update draft agent
        agent, _ = Agent.objects.update_or_create(
            email=email,
            defaults={
                'fullname': fullname,
                'mobile': mobile,
                'status': 'pending_otp',
                'registration_step': 0,
            },
        )

        # Store OTP in session
        request.session['registration_otp'] = otp
        request.session['registration_otp_email'] = email
        request.session['registration_otp_time'] = int(time.time())
        request.session['current_agent_id'] = agent.pk

        # Send OTP via Brevo
        sent = _send_otp_via_brevo(email, otp)
        logger.info(f"OTP sent to {email}: {sent}")

        return JsonResponse({
            'success': True,
            'message': 'OTP sent to your email.',
            'agent_id': agent.pk,
            'otp_sent': sent,
            'debug_otp': otp if settings.DEBUG else None,
        })
    except Exception as e:
        logger.error(f"register_step1 error: {e}")
        return JsonResponse({'success': False, 'message': str(e) if settings.DEBUG else 'Registration failed.'}, status=500)


# ---------------------------------------------------------------------------
# Verify OTP
# ---------------------------------------------------------------------------
@csrf_exempt
@require_POST
def verify_otp(request):
    """Verify the OTP entered by the user."""
    entered = (request.POST.get('otp') or '').strip()
    stored = request.session.get('registration_otp')
    stored_time = request.session.get('registration_otp_time', 0)

    if not stored or not entered:
        return JsonResponse({'success': False, 'message': 'OTP required.'}, status=400)

    if int(time.time()) - int(stored_time) > 600:
        return JsonResponse({'success': False, 'message': 'OTP expired. Please resend.'}, status=400)

    if entered != stored:
        return JsonResponse({'success': False, 'message': 'Invalid OTP.'}, status=400)

    agent_id = request.session.get('current_agent_id')
    agent = Agent.objects.filter(pk=agent_id).first()
    if agent:
        agent.email_verified_at = timezone.now()
        agent.status = 'incomplete'
        agent.registration_step = 1
        agent.save()

    request.session.pop('registration_otp', None)

    return JsonResponse({'success': True, 'message': 'Email verified successfully.'})


# ---------------------------------------------------------------------------
# Resend OTP
# ---------------------------------------------------------------------------
@csrf_exempt
@require_POST
def resend_otp(request):
    """Resend OTP to the same email."""
    email = request.session.get('registration_otp_email')
    if not email:
        return JsonResponse({'success': False, 'message': 'No email in session.'}, status=400)

    otp = str(random.randint(100000, 999999))
    request.session['registration_otp'] = otp
    request.session['registration_otp_time'] = int(time.time())

    sent = _send_otp_via_brevo(email, otp)
    return JsonResponse({
        'success': True,
        'message': 'OTP resent.',
        'debug_otp': otp if settings.DEBUG else None,
    })


# ---------------------------------------------------------------------------
# Step 2: Professional details (draft)
# ---------------------------------------------------------------------------
@csrf_exempt
@require_POST
def register_step2(request):
    """Save professional details to registration_draft JSON."""
    agent_id = request.session.get('current_agent_id') or request.POST.get('agent_id')
    agent = Agent.objects.filter(pk=agent_id).first()
    if not agent:
        return JsonResponse({'success': False, 'message': 'Session expired.'}, status=400)

    draft = agent.registration_draft or {}
    draft.update({
        'license_number': request.POST.get('license_number', ''),
        'pan_number': request.POST.get('pan_number', ''),
        'software_name': request.POST.get('software_name', ''),
        'portfolio_breakdown': request.POST.get('portfolio_breakdown', ''),
        'desired_services': request.POST.getlist('desired_services'),
    })
    agent.registration_draft = draft
    agent.registration_step = 2
    agent.status = 'incomplete'

    # Handle referral code from POST
    ref_code = request.POST.get('referral_code', '').strip()
    if ref_code:
        agent.referred_by_code = ref_code

    # User types + insurance companies from POST
    if request.POST.getlist('user_types'):
        agent.user_types = request.POST.getlist('user_types')
    if request.POST.getlist('insurance_companies'):
        agent.insurance_companies = request.POST.getlist('insurance_companies')
    agent.experience_range = request.POST.get('experience_range', agent.experience_range)
    agent.client_base = request.POST.get('client_base', agent.client_base)
    agent.save()

    return JsonResponse({'success': True, 'message': 'Details saved.', 'agent_id': agent.pk})


# ---------------------------------------------------------------------------
# Complete Registration (create Razorpay order)
# ---------------------------------------------------------------------------
@csrf_exempt
@require_POST
def complete_registration(request):
    """Create Razorpay order for payment step."""
    try:
        agent_id = request.session.get('current_agent_id') or request.POST.get('agent_id')
        agent = Agent.objects.filter(pk=agent_id).first()
        if not agent:
            return JsonResponse({'success': False, 'message': 'Session expired.'}, status=400)

        plan_type = request.POST.get('plan_type', 'professional')
        plan_name = request.POST.get('plan_name', 'Professional')
        plan_amount = float(request.POST.get('plan_amount', 0))

        # Calculate GST (18%)
        gst = plan_amount * 0.18
        total_amount = round(plan_amount + gst)

        razorpay_key = getattr(settings, 'RAZORPAY_KEY', '')
        razorpay_secret = getattr(settings, 'RAZORPAY_SECRET', '')
        razorpay_order = None

        if razorpay_key and razorpay_secret and razorpay_key != 'your_razorpay_key_here':
            import razorpay
            client = razorpay.Client(auth=(razorpay_key, razorpay_secret))
            amount_paise = total_amount * 100
            order_data = {
                'receipt': f'agent_{agent.pk}_{int(time.time())}',
                'amount': amount_paise,
                'currency': 'INR',
                'payment_capture': 1,
                'notes': {
                    'agent_id': str(agent.pk),
                    'agent_email': agent.email,
                    'plan_type': plan_type,
                    'plan_name': plan_name,
                    'purpose': f'Agent Registration - {plan_name}',
                },
            }
            try:
                razorpay_order = client.order.create(data=order_data)
                logger.info(f"Razorpay order created: {razorpay_order['id']}")
            except Exception as e:
                logger.error(f"Razorpay order creation failed: {e}")
                razorpay_order = None

        # Create/update subscription record
        sub, _ = AgentSubscription.objects.update_or_create(
            agent=agent, payment_status='pending',
            defaults={
                'selected_plan': plan_name,
                'registration_amount': total_amount,
                'razorpay_order_id': razorpay_order['id'] if razorpay_order else None,
                'status': 'inactive',
            },
        )

        agent.registration_step = 3
        agent.status = 'pending_payment'
        agent.save()

        if razorpay_order:
            return JsonResponse({
                'success': True,
                'order_id': razorpay_order['id'],
                'amount': total_amount * 100,
                'currency': 'INR',
                'key': razorpay_key,
                'agent_id': agent.pk,
                'name': agent.fullname,
                'email': agent.email,
                'mobile': agent.mobile,
                'plan_type': plan_type,
                'plan_name': plan_name,
                'plan_amount': plan_amount,
                'total_amount': total_amount,
                'test_payment': razorpay_key[:8] == 'rzp_test',
            })
        else:
            # Fallback: auto-complete for test env
            sub.payment_status = 'completed'
            sub.status = 'active'
            sub.razorpay_payment_id = f'test_pay_{int(time.time())}'
            sub.razorpay_order_id = f'test_order_{int(time.time())}'
            sub.starts_at = timezone.now()
            sub.expires_at = timezone.now() + timezone.timedelta(days=365)
            sub.save()
            agent.status = 'inactive'
            agent.registration_step = 2
            agent.save()
            return JsonResponse({
                'success': True,
                'message': 'We have received your payment. Login credentials sent to email.',
                'test_payment': True,
                'agent_id': agent.pk,
            })
    except Exception as e:
        logger.error(f"complete_registration error: {e}")
        msg = str(e) if settings.DEBUG else 'Registration error. Please try again.'
        return JsonResponse({'success': False, 'message': msg}, status=500)


# ---------------------------------------------------------------------------
# Payment Success
# ---------------------------------------------------------------------------
@csrf_exempt
@require_POST
def handle_payment_success(request):
    """Handle client-side Razorpay payment success callback."""
    try:
        agent_id = request.POST.get('agent_id')
        agent = Agent.objects.filter(pk=agent_id).first()
        if not agent:
            return JsonResponse({'success': False, 'message': 'Agent not found'}, status=404)

        # Idempotency
        if agent.status == 'active' and AgentSubscription.objects.filter(
            agent=agent, payment_status='completed'
        ).exists():
            return JsonResponse({'success': True, 'message': 'Payment already processed.'})

        rpay_pid = request.POST.get('razorpay_payment_id', '')
        rpay_oid = request.POST.get('razorpay_order_id', '')
        rpay_sig = request.POST.get('razorpay_signature', '')

        if not rpay_pid or not rpay_oid or not rpay_sig:
            return JsonResponse({'success': False, 'message': 'Missing payment data'}, status=400)

        # Verify signature
        rkey = getattr(settings, 'RAZORPAY_KEY', '')
        rsecret = getattr(settings, 'RAZORPAY_SECRET', '')
        if rkey and rsecret and rkey != 'your_razorpay_key_here':
            import razorpay
            client = razorpay.Client(auth=(rkey, rsecret))
            client.utility.verify_payment_signature({
                'razorpay_order_id': rpay_oid,
                'razorpay_payment_id': rpay_pid,
                'razorpay_signature': rpay_sig,
            })

        # Update subscription
        sub = AgentSubscription.objects.filter(razorpay_order_id=rpay_oid).first()
        plan_type = request.POST.get('plan_type', 'professional')
        if sub:
            plan_name_lower = (sub.selected_plan or '').lower()
            if 'trial' in plan_name_lower:
                plan_type = 'free_trial'

            trial_config = _get_site_setting('trial_plan_config', {'duration_days': 30})
            dur_days = int(trial_config.get('duration_days', 30)) if isinstance(trial_config, dict) else 30
            expiry = (
                timezone.now() + timezone.timedelta(days=dur_days)
                if plan_type == 'free_trial'
                else timezone.now() + timezone.timedelta(days=365)
            )
            sub.payment_status = 'completed'
            sub.status = 'active'
            sub.razorpay_payment_id = rpay_pid
            sub.razorpay_signature = rpay_sig
            sub.starts_at = timezone.now()
            sub.expires_at = expiry
            sub.save()

        # Update agent
        agent_data = {'registration_step': 2}
        if plan_type == 'free_trial':
            trial_config = _get_site_setting('trial_plan_config', {'duration_days': 30})
            upgrade_disc = _get_site_setting('trial_upgrade_discount', 20)
            dur = int(trial_config.get('duration_days', 30)) if isinstance(trial_config, dict) else 30
            agent_data['status'] = 'active'
            agent_data['plan_type'] = 'free_trial'
            agent_data['trial_ends_at'] = timezone.now() + timezone.timedelta(days=dur)
            agent_data['upgrade_discount_percent'] = float(upgrade_disc) if upgrade_disc else 0
        else:
            agent_data['status'] = 'pending_approval'
            agent_data['plan_type'] = plan_type

        for k, v in agent_data.items():
            setattr(agent, k, v)
        agent.save()

        # Commit draft data
        _commit_registration_data(agent)

        # Credit referral
        _credit_referral(agent)

        # Create/link user
        user = _create_or_link_user(agent)

        # Send credentials email (non-blocking)
        try:
            _send_credentials_via_brevo(agent, agent.email)
        except Exception as e:
            logger.error(f"Credentials email failed: {e}")

        request.session.pop('current_agent_id', None)

        return JsonResponse({
            'success': True,
            'message': 'Payment successful! Welcome to PadosiAgent.',
            'redirect_url': '/agent/dashboard/',
        })
    except Exception as e:
        logger.error(f"handle_payment_success error: {e}")
        msg = f'Payment verification failed: {e}' if settings.DEBUG else 'Payment verification failed.'
        return JsonResponse({'success': False, 'message': msg}, status=400)


# ---------------------------------------------------------------------------
# Payment Failure
# ---------------------------------------------------------------------------
@csrf_exempt
@require_POST
def handle_payment_failure(request):
    """Log payment failure."""
    agent_id = request.POST.get('agent_id')
    agent = Agent.objects.filter(pk=agent_id).first()
    if agent:
        sub = AgentSubscription.objects.filter(
            agent=agent, payment_status='pending'
        ).order_by('-created_at').first()
        if sub:
            sub.payment_status = 'failed'
            sub.save()
        agent.status = 'pending_payment'
        agent.save()
    return JsonResponse({'success': True, 'message': 'Payment failure logged.'})


# ---------------------------------------------------------------------------
# Razorpay Webhook
# ---------------------------------------------------------------------------
@csrf_exempt
def razorpay_webhook(request):
    """Handle Razorpay server-to-server webhook."""
    payload = request.body
    sig = request.headers.get('X-Razorpay-Signature', '')
    webhook_secret = getattr(settings, 'RAZORPAY_WEBHOOK_SECRET', '')

    if not webhook_secret:
        logger.error("RAZORPAY_WEBHOOK_SECRET not configured")
        return HttpResponse('Webhook secret missing', status=400)

    data = json.loads(payload)
    event = data.get('event')
    if not event:
        return HttpResponse('Invalid event', status=400)

    logger.info(f"WEBHOOK EVENT: {event}")
    try:
        if event == 'payment.captured':
            _webhook_payment_captured(data['payload']['payment']['entity'])
        elif event == 'payment.failed':
            _webhook_payment_failed(data['payload']['payment']['entity'])
        elif event == 'order.paid':
            _webhook_order_paid(data['payload']['order']['entity'])
        return HttpResponse('OK', status=200)
    except Exception as e:
        logger.error(f"Webhook error: {e}", exc_info=True)
        return HttpResponse('Error', status=500)


def _webhook_payment_captured(payment):
    order_id = payment['order_id']
    sub = AgentSubscription.objects.filter(razorpay_order_id=order_id).first()
    if not sub:
        return
    sub.payment_status = 'completed'
    sub.status = 'active'
    sub.razorpay_payment_id = payment['id']
    sub.starts_at = timezone.now()
    sub.expires_at = timezone.now() + timezone.timedelta(days=365)
    sub.save()
    agent = sub.agent
    agent.status = 'inactive'
    agent.registration_step = 2
    agent.save()
    _commit_registration_data(agent)
    _credit_referral(agent)
    _create_or_link_user(agent)


def _webhook_payment_failed(payment):
    order_id = payment['order_id']
    sub = AgentSubscription.objects.filter(razorpay_order_id=order_id).first()
    if sub:
        sub.payment_status = 'failed'
        sub.status = 'inactive'
        sub.save()


def _webhook_order_paid(order):
    sub = AgentSubscription.objects.filter(razorpay_order_id=order['id']).first()
    if sub and sub.payment_status != 'completed':
        sub.payment_status = 'completed'
        sub.status = 'active'
        sub.starts_at = timezone.now()
        sub.expires_at = timezone.now() + timezone.timedelta(days=365)
        sub.save()
        agent = sub.agent
        agent.status = 'active'
        agent.registration_step = 2
        agent.save()
        _commit_registration_data(agent)
        _credit_referral(agent)
        _create_or_link_user(agent)


# ---------------------------------------------------------------------------
# Check Email
# ---------------------------------------------------------------------------
@csrf_exempt
@require_POST
def check_email(request):
    email = (request.POST.get('email') or '').strip().lower()
    if not email:
        return JsonResponse({'success': False, 'message': 'Email required'}, status=400)
    exists = Agent.objects.filter(email=email).exclude(
        status__in=['incomplete', 'pending_otp']
    ).exists()
    return JsonResponse({'success': True, 'available': not exists})


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------
def _commit_registration_data(agent):
    """Commit draft JSON data to AgentProfile (from commitRegistrationData)."""
    draft = agent.registration_draft
    if not draft:
        return
    try:
        profile, _ = AgentProfile.objects.get_or_create(agent=agent)
        profile.license_number = draft.get('license_number') or profile.license_number
        profile.pan_number = draft.get('pan_number') or profile.pan_number
        profile.software_name = draft.get('software_name') or profile.software_name
        profile.portfolio_breakdown = draft.get('portfolio_breakdown') or profile.portfolio_breakdown
        profile.desired_services = draft.get('desired_services') or profile.desired_services
        profile.save()
    except Exception as e:
        logger.error(f"Draft commit failed for agent {agent.pk}: {e}")


def _create_or_link_user(agent):
    """Create or link a User record for the agent (from createOrLinkUser)."""
    try:
        if agent.user_id:
            return agent.user
        user = User.objects.filter(email=agent.email).first()
        if not user:
            user = User.objects.create(
                fullname=agent.fullname,
                email=agent.email,
                password=make_password(agent.email),
                role='agent',
                status='active',
                email_verified_at=agent.email_verified_at,
            )
        else:
            user.role = 'agent'
            user.password = make_password(agent.email)
            user.save()
        agent.user_id = user.pk
        agent.save()
        return user
    except Exception as e:
        logger.error(f"Create/link user failed: {e}")
        return None


def _credit_referral(agent):
    """Credit referrer when referred agent completes payment (from creditReferral)."""
    try:
        ref_code = agent.referred_by_code
        if not ref_code:
            return
        from django.db import connection
        with connection.cursor() as c:
            c.execute(
                "SELECT id, agent_id, total_referrals FROM referral_codes "
                "WHERE code=%s AND is_active=1 LIMIT 1",
                [ref_code],
            )
            row = c.fetchone()
            if not row:
                return
            rc_id, referrer_agent_id, total_refs = row

            # Idempotency check
            c.execute(
                "SELECT id FROM referral_usages WHERE referred_agent_id=%s AND status='converted' LIMIT 1",
                [agent.pk],
            )
            if c.fetchone():
                return

            # Mark usage as converted
            c.execute(
                "INSERT INTO referral_usages "
                "(referral_code_id, referred_agent_id, referrer_agent_id, referred_agent_name, status, converted_at, created_at, updated_at) "
                "VALUES (%s,%s,%s,%s,'converted',%s,NOW(),NOW()) "
                "ON DUPLICATE KEY UPDATE status='converted', converted_at=%s",
                [rc_id, agent.pk, referrer_agent_id, agent.fullname, timezone.now(), timezone.now()],
            )

            # Increment total referrals
            c.execute("UPDATE referral_codes SET total_referrals=total_referrals+1 WHERE id=%s", [rc_id])
    except Exception as e:
        logger.error(f"creditReferral failed: {e}")
