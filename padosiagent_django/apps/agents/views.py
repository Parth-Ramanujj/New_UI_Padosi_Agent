"""
PadosiAgent — Agent Views (Module 2)
Converted from Laravel controllers:
  - AgentDashboardController
  - AgentProfileController
  - AgentController (lead capture / interaction tracking)
  - AgentPushTokenController
  - OgImageController
"""

import io
import json
import logging
import time

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.core.cache import cache
from django.db import models as db_models
from django.db.models import Sum, Count, Avg
from django.db.models.functions import Coalesce
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, get_object_or_404, redirect
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_GET

from .models import (
    Agent, AgentProfile, AgentProfileView, AgentLead,
    AgentLeadPreference, AgentPerformanceStat, AgentFamilyLicense,
    AgentInsuranceSegment, AgentPortfolio, AgentAchievementPhoto,
    AgentCareerTimeline, AgentReview, AgentSubscription,
    AgentDeviceToken, AgentProductExpertise, City,
)

logger = logging.getLogger(__name__)


# =============================================================================
# DASHBOARD  (from AgentDashboardController::index)
# =============================================================================
@login_required
def dashboard(request):
    """Agent dashboard — mirrors AgentDashboardController::index."""
    user = request.user
    if not hasattr(user, 'agent_record') or not user.agent_record.exists():
        return redirect('accounts:agent_login')

    agent = user.agent_record.first()
    agent_profile = AgentProfile.objects.filter(agent=agent).first()
    month_start = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # ── Lead statistics ──────────────────────────────────────────────────────
    try:
        base_qs         = AgentLead.objects.filter(agent=agent)
        total_leads     = base_qs.count()
        monthly_leads   = base_qs.filter(created_at__gte=month_start).count()
        new_leads       = base_qs.filter(lead_status='new').count()
        contacted_leads = base_qs.filter(lead_status='contacted').count()
        follow_up_leads = base_qs.filter(lead_status='follow_up').count()
        closed_leads    = base_qs.filter(lead_status='closed').count()
    except Exception as e:
        logger.warning(f"Dashboard lead stats unavailable: {e}")
        total_leads = monthly_leads = new_leads = contacted_leads = follow_up_leads = closed_leads = 0

    active_leads    = new_leads + contacted_leads + follow_up_leads
    conversion_rate = round((closed_leads / total_leads) * 100, 1) if total_leads > 0 else 0

    # ── Profile-view statistics ───────────────────────────────────────────────
    try:
        total_page_views = AgentProfileView.objects.filter(
            agent=agent
        ).aggregate(total=Coalesce(Sum('view_count'), 0))['total']
        monthly_visits = AgentProfileView.objects.filter(
            agent=agent, view_date__gte=month_start.date()
        ).aggregate(total=Coalesce(Sum('view_count'), 0))['total']
    except Exception as e:
        logger.warning(f"Dashboard profile-view stats unavailable: {e}")
        total_page_views = monthly_visits = 0

    # ── Recent leads (last 10) ────────────────────────────────────────────────
    try:
        recent_leads = list(AgentLead.objects.filter(agent=agent).order_by('-created_at')[:10])
    except Exception as e:
        logger.warning(f"Dashboard recent leads unavailable: {e}")
        recent_leads = []

    # ── dashboardStats dict (mirrors Laravel view-compact keys) ──────────────
    dashboard_stats = {
        'conversionRate':  conversion_rate,
        'monthlyTarget':   0,
        'totalPageViews':  total_page_views,
        'contactRequests': total_leads,
        'monthlyVisits':   monthly_visits,
        'totalLeads':      total_leads,
        'monthlyLeads':    monthly_leads,
        'newLeads':        new_leads,
        'contactedLeads':  contacted_leads,
        'followUpLeads':   follow_up_leads,
        'closedLeads':     closed_leads,
        'activeLeads':     active_leads,
    }

    # ── Referral visibility ───────────────────────────────────────────────────
    show_referral = (agent.plan_type == 'free_trial')

    # ── Profile display helpers ───────────────────────────────────────────────
    profile_photo_url = agent_profile.profile_photo_url if agent_profile else None
    display_name      = (agent_profile.display_name
                         if agent_profile and agent_profile.display_name
                         else agent.fullname) or ''
    display_initial   = display_name[0].upper() if display_name else 'A'

    plan_labels = {'free_trial': 'Free Trial', 'starter': 'Starter', 'professional': 'Professional'}
    plan_name   = plan_labels.get(agent.plan_type or '', 'Free Trial')

    # ── Trial / pricing vars ──────────────────────────────────────────────────
    is_on_trial  = agent.is_on_free_trial()
    days_left    = 0
    if is_on_trial and agent.trial_ends_at:
        delta     = agent.trial_ends_at - timezone.now()
        days_left = max(0, delta.days)
    discount_pct  = int(agent.upgrade_discount_percent or 0)
    starter_full  = 2359
    starter_disc  = round(starter_full  * (1 - discount_pct / 100))
    prof_full     = 8258
    prof_disc     = round(prof_full * (1 - discount_pct / 100))

    # ── Profile completion % ──────────────────────────────────────────────────
    completion_checks = [
        bool(agent_profile and agent_profile.profile_photo_path),
        bool(agent_profile and agent_profile.office_address),
        bool(agent.experience_range),
        bool(agent_profile and agent_profile.whatsapp),
        bool(agent_profile and getattr(agent_profile, 'license_number', None)),
        bool(agent_profile and agent_profile.languages),
    ]
    completion = round(sum(completion_checks) / len(completion_checks) * 100)

    # ── City / segment labels ─────────────────────────────────────────────────
    try:
        cities       = list(agent.serviceable_city_set.all()[:5])
        city_display = ', '.join(c.name for c in cities) if cities else 'Not set'
    except Exception:
        city_display = 'Not set'
    try:
        segment_labels = list(agent.insurance_segments.values_list('segment_type', flat=True))
    except Exception:
        segment_labels = []

    context = {
        'agent':            agent,
        'profile':          agent_profile,
        # camelCase keys used by the converted template, snake_case for convenience
        'dashboardStats':   dashboard_stats,
        'dashboard_stats':  dashboard_stats,
        'recentLeads':      recent_leads,
        'recent_leads':     recent_leads,
        'showReferral':     show_referral,
        'show_referral':    show_referral,
        'profilePhotoUrl':  profile_photo_url,
        'profile_photo_url': profile_photo_url,
        'displayName':      display_name,
        'display_name':     display_name,
        'displayInitial':   display_initial,
        'display_initial':  display_initial,
        'planName':         plan_name,
        'plan_name':        plan_name,
        'isOnTrial':        is_on_trial,
        'is_on_trial':      is_on_trial,
        'daysLeft':         days_left,
        'days_left':        days_left,
        'discountPct':      discount_pct,
        'discount_pct':     discount_pct,
        'starterFull':      starter_full,
        'starterDisc':      starter_disc,
        'profFull':         prof_full,
        'profDisc':         prof_disc,
        'completion':       completion,
        'cityDisplay':      city_display,
        'city_display':     city_display,
        'segmentLabels':    segment_labels,
        'segment_labels':   segment_labels,
    }
    return render(request, 'agents/dashboard.html', context)



# =============================================================================
# REFERRAL PAGE  (from AgentDashboardController::referral)
# =============================================================================
@login_required
def referral(request):
    """Referral program page with tier progress."""
    user = request.user
    agent = user.agent_record.first()
    if not agent:
        return redirect('accounts:agent_login')

    referral_code = None
    referral_count = 0
    referral_usages = []

    try:
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT id, code, total_referrals, reward_type FROM referral_codes "
                "WHERE agent_id = %s AND is_active = 1 LIMIT 1",
                [agent.pk],
            )
            row = cursor.fetchone()
            if row:
                referral_code = row[1]
                referral_count = row[2] or 0

                cursor.execute(
                    "SELECT referred_agent_name, status, converted_at "
                    "FROM referral_usages WHERE referral_code_id = %s "
                    "ORDER BY created_at DESC",
                    [row[0]],
                )
                referral_usages = [
                    {'name': r[0], 'status': r[1], 'converted_at': r[2]}
                    for r in cursor.fetchall()
                ]
    except Exception as e:
        logger.warning(f"Referral query failed: {e}")

    context = {
        'agent': agent,
        'referral_code': referral_code,
        'referral_count': referral_count,
        'referral_usages': referral_usages,
    }
    return render(request, 'agents/referral.html', context)


# =============================================================================
# PUBLIC PROFILE  (from AgentProfileController::showProfile)
# =============================================================================
def show_profile(request, slug):
    """Public agent profile page (by slug or numeric ID fallback)."""
    agent = Agent.objects.filter(profile__slug=slug).first()

    if not agent and slug.isdigit():
        agent = Agent.objects.filter(pk=int(slug)).first()

    if not agent:
        from django.http import Http404
        raise Http404("Agent not found")

    is_owner = (
        request.user.is_authenticated
        and request.user.agent_record.filter(pk=agent.pk).exists()
    )

    # Track profile view (30-min cooldown per session)
    if not is_owner:
        try:
            session_key = f'agent_profile_viewed_{agent.pk}'
            last_viewed = request.session.get(session_key)
            cooldown = 30 * 60
            now_ts = int(time.time())
            if not last_viewed or (now_ts - int(last_viewed)) > cooldown:
                from django.db.models import F
                obj, created = AgentProfileView.objects.get_or_create(
                    agent=agent,
                    view_date=timezone.now().date(),
                    defaults={'view_count': 1},
                )
                if not created:
                    AgentProfileView.objects.filter(pk=obj.pk).update(
                        view_count=F('view_count') + 1
                    )
                request.session[session_key] = now_ts
        except Exception as e:
            if settings.DEBUG:
                logger.warning(f"Profile tracking failed: {e}")

    context = {'agent': agent, 'is_owner': is_owner}
    return render(request, 'agents/profile_view.html', context)


# =============================================================================
# EDIT PROFILE  (from AgentProfileController::edit)
# =============================================================================
@login_required
def edit_profile(request):
    """Edit profile form page."""
    agent = request.user.agent_record.first()
    if not agent:
        return redirect('accounts:agent_login')

    context = {'agent': agent}
    return render(request, 'agents/edit_profile.html', context)


# =============================================================================
# UPDATE PROFILE  (from AgentProfileController::update)
# =============================================================================
@login_required
@require_POST
def update_profile(request):
    """Step-based profile update (JSON response)."""
    from django.db import transaction

    agent = request.user.agent_record.first()
    if not agent:
        return JsonResponse({'status': 'error', 'message': 'Agent not found'}, status=403)

    current_step = request.POST.get('current_step')
    profile, _ = AgentProfile.objects.get_or_create(agent=agent)

    try:
        with transaction.atomic():
            should_process = lambda step: not current_step or str(current_step) == str(step)

            # Step 1: Basic Info
            if should_process(1):
                agent.fullname = request.POST.get('full_name', agent.fullname)
                agent.email = request.POST.get('email', agent.email)
                agent.mobile = request.POST.get('mobile', agent.mobile)
                if request.POST.getlist('user_types'):
                    agent.user_types = request.POST.getlist('user_types')
                agent.save()

                profile.display_name = request.POST.get('display_name', profile.display_name)
                profile.whatsapp = request.POST.get('whatsapp', profile.whatsapp)
                profile.languages = request.POST.get('languages', profile.languages)
                profile.address = request.POST.get('address', profile.address)

                if 'profile_photo' in request.FILES:
                    # Cloudinary upload (with local fallback)
                    photo_file = request.FILES['profile_photo']
                    try:
                        import cloudinary.uploader
                        result = cloudinary.uploader.upload(
                            photo_file,
                            folder='padosiagent/profiles',
                            public_id=f'agent_{agent.pk}_{int(time.time())}',
                            overwrite=True,
                            resource_type='image',
                        )
                        profile.profile_photo_path = result.get('secure_url', '')
                    except Exception as e:
                        logger.error(f"Cloudinary upload failed: {e}")
                        from django.core.files.storage import default_storage
                        path = default_storage.save(
                            f'agent/profiles/{photo_file.name}', photo_file
                        )
                        profile.profile_photo_path = path

                profile.save()

            # Step 2: Professional
            if should_process(2):
                profile.pan_number = request.POST.get('pan', profile.pan_number)
                profile.agency_name = request.POST.get('agency_name', profile.agency_name)
                profile.office_address = request.POST.get('office_address', profile.office_address)
                profile.service_pincode = request.POST.get('service_pincode', profile.service_pincode)
                profile.has_pos_license = request.POST.get('has_pos_license') == '1'
                profile.save()

                agent.experience_range = request.POST.get('experience_years', agent.experience_range)
                agent.client_base = request.POST.get('client_base', agent.client_base)
                if request.POST.getlist('insurance_companies'):
                    agent.insurance_companies = request.POST.getlist('insurance_companies')
                agent.save()

                # Family Licenses
                AgentFamilyLicense.objects.filter(agent=agent).delete()
                idx = 0
                while request.POST.get(f'family_members[{idx}][name]'):
                    AgentFamilyLicense.objects.create(
                        agent=agent,
                        full_name=request.POST.get(f'family_members[{idx}][name]', ''),
                        relationship=request.POST.get(f'family_members[{idx}][relationship]', ''),
                        license_number=request.POST.get(f'family_members[{idx}][license]', ''),
                    )
                    idx += 1

                # Performance Stats
                AgentPerformanceStat.objects.update_or_create(
                    agent=agent,
                    defaults={
                        'claims_processed': request.POST.get('claims_processed', 0),
                        'claims_settled': request.POST.get('claims_settled', 0),
                        'claims_amount': request.POST.get('claims_amount', 0),
                        'success_rate': request.POST.get('success_rate', 0),
                        'response_time': request.POST.get('response_time', ''),
                    },
                )

                # Serviceable Cities
                city_names = request.POST.getlist('serviceable_cities')
                city_ids = []
                for name in city_names:
                    from django.utils.text import slugify
                    city_obj, _ = City.objects.get_or_create(
                        name=name,
                        defaults={'slug': slugify(name), 'is_active': True},
                    )
                    city_ids.append(city_obj.pk)
                agent.serviceable_city_set.set(city_ids)

            # Step 3: Insurance Segments
            if should_process(3):
                AgentInsuranceSegment.objects.filter(agent=agent).delete()
                for seg in request.POST.getlist('segments'):
                    AgentInsuranceSegment.objects.create(agent=agent, segment_type=seg)

                AgentProductExpertise.objects.filter(agent=agent).delete()
                # expertise data comes as nested keys like expertise[life][term]=3
                for key, val in request.POST.items():
                    if key.startswith('expertise['):
                        parts = key.replace('expertise[', '').rstrip(']').split('][')
                        if len(parts) == 2 and int(val) > 0:
                            AgentProductExpertise.objects.create(
                                agent=agent,
                                segment_type=parts[0],
                                product_name=parts[1],
                                expertise_level=int(val),
                            )

            # Step 4: Portfolios
            if should_process(4) and request.POST.get('portfolio'):
                AgentPortfolio.objects.filter(agent=agent).delete()
                portfolio_data = request.POST.get('portfolio')
                if isinstance(portfolio_data, str):
                    portfolio_data = json.loads(portfolio_data)
                if isinstance(portfolio_data, dict):
                    for seg_type, pdata in portfolio_data.items():
                        primary_name = pdata.get('primary_company', '')
                        if primary_name:
                            AgentPortfolio.objects.create(
                                agent=agent,
                                segment_type=seg_type,
                                primary_companies={
                                    'name': primary_name,
                                    'percentage': pdata.get('primary_percent', ''),
                                },
                                secondary_companies={
                                    'name': pdata.get('secondary_company', ''),
                                    'percentage': pdata.get('secondary_percent', ''),
                                    'others': pdata.get('other_companies', ''),
                                },
                            )

            # Step 5: Social Links & Achievement Photos
            if should_process(5):
                profile.website_url = request.POST.get('website', profile.website_url)
                profile.social_links = {
                    'google_business': request.POST.get('google_business', ''),
                    'linkedin': request.POST.get('linkedin_url', ''),
                    'instagram': request.POST.get('instagram_url', ''),
                    'facebook': request.POST.get('facebook_url', ''),
                    'youtube': request.POST.get('youtube_url', ''),
                }
                profile.career_highlights = request.POST.get('career_highlights', profile.career_highlights)
                profile.save()

                # Remove photos
                for photo_id in request.POST.getlist('remove_photos'):
                    AgentAchievementPhoto.objects.filter(
                        agent=agent, pk=int(photo_id)
                    ).delete()

                # Upload new achievement photos
                for photo_file in request.FILES.getlist('achievement_photos'):
                    try:
                        import cloudinary.uploader
                        result = cloudinary.uploader.upload(
                            photo_file,
                            folder='padosiagent/achievements',
                            public_id=f'achievement_{agent.pk}_{int(time.time())}',
                            resource_type='image',
                        )
                        AgentAchievementPhoto.objects.create(
                            agent=agent,
                            photo_path=result.get('secure_url', ''),
                        )
                    except Exception:
                        from django.core.files.storage import default_storage
                        path = default_storage.save(
                            f'agent/achievements/{photo_file.name}', photo_file
                        )
                        AgentAchievementPhoto.objects.create(
                            agent=agent, photo_path=path,
                        )

                # Career Timelines
                AgentCareerTimeline.objects.filter(agent=agent).delete()
                idx = 0
                while request.POST.get(f'career_timelines[{idx}][event_text]'):
                    AgentCareerTimeline.objects.create(
                        agent=agent,
                        event_type=request.POST.get(f'career_timelines[{idx}][type]', 'Career Event'),
                        event_text=request.POST.get(f'career_timelines[{idx}][event_text]', ''),
                        month=request.POST.get(f'career_timelines[{idx}][month]', ''),
                        year=request.POST.get(f'career_timelines[{idx}][year]', ''),
                    )
                    idx += 1

            # Step 6: Lead Preferences
            if should_process(6):
                lead_types = request.POST.getlist('lead_types')
                AgentLeadPreference.objects.update_or_create(
                    agent=agent,
                    defaults={
                        'leads_new_business': 'new_business' in lead_types,
                        'leads_portfolio_analysis': 'portfolio_analysis' in lead_types,
                        'portfolio_charging': request.POST.get('portfolio_charging', ''),
                        'portfolio_fee': request.POST.get('portfolio_fee', 0) or 0,
                        'leads_claims_support': 'claims_support' in lead_types,
                        'claims_charging': request.POST.get('claims_charging', ''),
                        'claims_fee_amount': request.POST.get('claims_fee_amount', 0) or 0,
                        'claims_percent': request.POST.get('claims_percent', 0) or 0,
                    },
                )

            # Step 7: Final declaration → mark pending_approval
            is_final = not current_step or (
                str(current_step) == '7' and request.POST.get('final_declaration')
            )
            if is_final and agent.status != 'pending_approval':
                agent.status = 'pending_approval'
                agent.save()

        return JsonResponse({
            'status': 'success',
            'message': 'Profile saved successfully' if is_final else 'Progress saved',
            'redirect': '/agent/dashboard/' if is_final else None,
            'profile_photo_url': profile.profile_photo_url,
        })

    except Exception as e:
        logger.error(f"Profile update failed: {e}", exc_info=True)
        msg = f"Error: {e}" if settings.DEBUG else "An error occurred. Please try again."
        return JsonResponse({'status': 'error', 'message': msg}, status=500)


# =============================================================================
# STORE REVIEW  (from AgentProfileController::storeReview)
# =============================================================================
@require_POST
def store_review(request, slug):
    """Submit or update a review for an agent."""
    from .forms import AgentReviewForm
    
    agent = Agent.objects.filter(profile__slug=slug).first()
    if not agent and slug.isdigit():
        agent = Agent.objects.filter(pk=int(slug)).first()
    if not agent:
        return JsonResponse({'status': 'error', 'message': 'Agent not found'}, status=404)

    # Prevent self-review
    if request.user.is_authenticated:
        if request.user.agent_record.filter(pk=agent.pk).exists():
            return JsonResponse({'status': 'error', 'message': 'You cannot review yourself'}, status=403)

    form = AgentReviewForm(request.POST)
    if not form.is_valid():
        return JsonResponse({'status': 'error', 'message': 'Invalid form data', 'errors': form.errors}, status=422)

    cleaned_data = form.cleaned_data
    
    if request.user.is_authenticated:
        review_obj, created = AgentReview.objects.update_or_create(
            agent=agent, user=request.user,
            defaults={
                'reviewer_name': request.user.fullname,
                'reviewer_email': request.user.email,
                'rating': cleaned_data['rating'],
                'review': cleaned_data['review'],
                'is_approved': True,
            },
        )
    else:
        email = cleaned_data.get('reviewer_email', '').lower()
        review_obj, created = AgentReview.objects.update_or_create(
            agent=agent, reviewer_email=email,
            defaults={
                'reviewer_name': cleaned_data.get('reviewer_name', ''),
                'reviewer_mobile': cleaned_data.get('reviewer_mobile', ''),
                'rating': cleaned_data['rating'],
                'review': cleaned_data['review'],
                'is_approved': True,
            },
        )

    msg = 'Review submitted successfully!' if created else 'Review updated successfully!'
    return JsonResponse({'status': 'success', 'message': msg})


# =============================================================================
# LEAD CAPTURE  (from AgentLeadController::capture)
# =============================================================================
@csrf_exempt
@require_POST
def capture_lead(request):
    """Capture a lead from the public profile page."""
    from .forms import AgentLeadForm
    
    agent_id = request.POST.get('agent_id')
    if not agent_id:
        return JsonResponse({'success': False, 'message': 'Agent ID required'}, status=400)

    agent = Agent.objects.filter(pk=agent_id).first()
    if not agent:
        return JsonResponse({'success': False, 'message': 'Agent not found'}, status=404)

    form = AgentLeadForm(request.POST)
    if form.is_valid():
        lead = form.save(commit=False)
        lead.agent = agent
        lead.lead_status = 'new'
        lead.save()
        return JsonResponse({'success': True, 'message': 'Lead captured successfully'})
    
    return JsonResponse({'success': False, 'message': 'Invalid data', 'errors': form.errors}, status=422)


# =============================================================================
# PUSH TOKEN  (from AgentPushTokenController::store)
# =============================================================================
@login_required
@require_POST
def store_push_token(request):
    """Store FCM device token for push notifications."""
    agent = request.user.agent_record.first()
    if not agent:
        return JsonResponse({'message': 'Agent not found.'}, status=403)

    token = request.POST.get('token', '')
    platform = request.POST.get('platform')
    if not token:
        return JsonResponse({'message': 'Token required.'}, status=400)

    AgentDeviceToken.objects.update_or_create(
        token=token,
        defaults={
            'agent': agent,
            'platform': platform,
            'last_seen_at': timezone.now(),
        },
    )
    return JsonResponse({'message': 'Token saved.'})


# =============================================================================
# OG IMAGE  (from OgImageController::generate)
# =============================================================================
def og_image(request, agent_id):
    """Generate an 800×800 OG image for WhatsApp sharing."""
    cache_key = f'og_image_agent_photo_fit_{agent_id}'

    if request.GET.get('nocache') != '1':
        cached = cache.get(cache_key)
        if cached:
            return HttpResponse(cached, content_type='image/jpeg',
                                headers={'Cache-Control': 'public, max-age=86400'})

    try:
        from PIL import Image, ImageDraw, ImageFont
        import requests as http_requests

        agent = get_object_or_404(Agent, pk=agent_id)
        profile = AgentProfile.objects.filter(agent=agent).first()

        width, height = 800, 800
        im = Image.new('RGB', (width, height), (255, 255, 255))

        photo_loaded = False
        photo_url = None
        if profile and profile.profile_photo_path:
            raw = profile.profile_photo_path.split('?')[0]
            photo_url = raw if raw.startswith('http') else f"/media/{raw.lstrip('/')}"

        if photo_url:
            try:
                resp = http_requests.get(photo_url, timeout=10, verify=False)
                if resp.status_code == 200:
                    src = Image.open(io.BytesIO(resp.content))
                    src_w, src_h = src.size
                    ratio = src_w / src_h
                    target_ratio = width / height
                    if ratio > target_ratio:
                        dst_w, dst_h = width, int(width / ratio)
                        dst_x, dst_y = 0, (height - dst_h) // 2
                    else:
                        dst_w, dst_h = int(height * ratio), height
                        dst_x, dst_y = (width - dst_w) // 2, 0
                    src = src.resize((dst_w, dst_h), Image.LANCZOS)
                    im.paste(src, (dst_x, dst_y))
                    photo_loaded = True
            except Exception as e:
                logger.warning(f"OG image photo fetch failed: {e}")

        if not photo_loaded:
            im = Image.new('RGB', (width, height), (226, 232, 240))
            draw = ImageDraw.Draw(im)
            initial = (agent.fullname or 'A')[0].upper()
            try:
                font = ImageFont.truetype("Roboto-Bold.ttf", 300)
            except Exception:
                font = ImageFont.load_default()
            bbox = draw.textbbox((0, 0), initial, font=font)
            tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
            draw.text(((width - tw) / 2, (height - th) / 2), initial,
                      fill=(100, 116, 139), font=font)

        buf = io.BytesIO()
        im.save(buf, format='JPEG', quality=90)
        encoded = buf.getvalue()

        cache.set(cache_key, encoded, 86400)

        return HttpResponse(encoded, content_type='image/jpeg',
                            headers={'Cache-Control': 'public, max-age=86400'})

    except Exception as e:
        logger.error(f"OG image error: {e}")
        try:
            from PIL import Image
            im = Image.new('RGB', (800, 800), (15, 58, 102))
            buf = io.BytesIO()
            im.save(buf, format='JPEG', quality=50)
            return HttpResponse(buf.getvalue(), content_type='image/jpeg',
                                headers={'Cache-Control': 'no-store'})
        except Exception:
            return HttpResponse(status=500)


# =============================================================================
# LEAD MANAGEMENT  (from AgentLeadController / AgentDashboardController)
# =============================================================================

@login_required
def lead_list(request):
    """List all leads for the authenticated agent with optional status filter."""
    agent = request.user.agent_record.first()
    if not agent:
        return redirect('accounts:agent_login')

    status_filter = request.GET.get('status', '')
    qs = AgentLead.objects.filter(agent=agent).order_by('-created_at')
    if status_filter:
        qs = qs.filter(lead_status=status_filter)

    from django.core.paginator import Paginator
    paginator = Paginator(qs, 25)
    page_obj  = paginator.get_page(request.GET.get('page', 1))

    base_qs       = AgentLead.objects.filter(agent=agent)
    status_counts = {
        'all':       base_qs.count(),
        'new':       base_qs.filter(lead_status='new').count(),
        'contacted': base_qs.filter(lead_status='contacted').count(),
        'follow_up': base_qs.filter(lead_status='follow_up').count(),
        'closed':    base_qs.filter(lead_status='closed').count(),
    }

    context = {
        'agent':         agent,
        'page_obj':      page_obj,
        'leads':         page_obj,
        'status_filter': status_filter,
        'status_counts': status_counts,
    }
    return render(request, 'agents/leads.html', context)


@login_required
@require_POST
def lead_update_status(request, lead_id):
    """Update the status (and optional notes) of a lead — AJAX-friendly."""
    agent = request.user.agent_record.first()
    if not agent:
        return JsonResponse({'status': 'error', 'message': 'Unauthorized'}, status=403)

    lead = AgentLead.objects.filter(pk=lead_id, agent=agent).first()
    if not lead:
        return JsonResponse({'status': 'error', 'message': 'Lead not found'}, status=404)

    VALID_STATUSES = ['new', 'contacted', 'follow_up', 'closed']
    new_status = request.POST.get('lead_status', '').strip()
    if new_status not in VALID_STATUSES:
        return JsonResponse(
            {'status': 'error', 'message': f'Invalid status. Choose from: {VALID_STATUSES}'},
            status=422,
        )

    lead.lead_status = new_status
    lead.notes       = request.POST.get('notes', lead.notes)
    lead.save(update_fields=['lead_status', 'notes', 'updated_at'])

    return JsonResponse({
        'status':      'success',
        'message':     'Lead updated successfully.',
        'lead_id':     lead.pk,
        'lead_status': lead.lead_status,
    })


@login_required
def lead_detail(request, lead_id):
    """View / update notes for a single lead."""
    agent = request.user.agent_record.first()
    if not agent:
        return redirect('accounts:agent_login')

    lead = AgentLead.objects.filter(pk=lead_id, agent=agent).first()
    if not lead:
        from django.http import Http404
        raise Http404('Lead not found')

    if request.method == 'POST':
        lead.notes       = request.POST.get('notes', lead.notes)
        lead.lead_status = request.POST.get('lead_status', lead.lead_status)
        lead.save(update_fields=['notes', 'lead_status', 'updated_at'])
        return JsonResponse({'status': 'success', 'message': 'Lead notes saved.'})

    context = {'agent': agent, 'lead': lead}
    return render(request, 'agents/lead_detail.html', context)
