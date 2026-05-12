import logging
import math
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.db.models import F, Q, Count, Avg, Case, When, Value, DecimalField, IntegerField, ExpressionWrapper, Subquery, OuterRef
from django.db.models.functions import Cos, Sin, Radians, ACos, Cast, Coalesce, ExtractDay
from django.db.models import FloatField
from django.utils import timezone
from django.core.paginator import Paginator

from apps.agents.models import Agent, AgentPortfolio
from apps.frontend.models import Pincode
from apps.accounts.models import User

logger = logging.getLogger('apps')

def get_portfolio_companies_by_type():
    segment_label_map = {
        'health': 'Health Insurance',
        'life': 'Life Insurance',
        'motor': 'Motor Insurance',
        'sme': 'SME Insurance',
    }

    companies_by_type = {
        'Health Insurance': [],
        'Life Insurance': [],
        'Motor Insurance': [],
        'SME Insurance': [],
    }

    portfolios = AgentPortfolio.objects.filter(
        agent__status='active',
        agent__user__role='agent'
    ).values('segment_type', 'primary_companies', 'secondary_companies')

    for portfolio in portfolios:
        segment_key = str(portfolio['segment_type']).strip().lower()
        if segment_key not in segment_label_map:
            continue

        bucket = segment_label_map[segment_key]
        candidates = []

        primary = portfolio.get('primary_companies') or {}
        secondary = portfolio.get('secondary_companies') or {}

        primary_name = str(primary.get('name', '')).strip()
        secondary_name = str(secondary.get('name', '')).strip()

        if primary_name:
            candidates.append(primary_name)
        if secondary_name:
            candidates.append(secondary_name)

        extra_companies = secondary.get('companies', [])
        if isinstance(extra_companies, list):
            for company in extra_companies:
                if isinstance(company, dict):
                    c_name = str(company.get('name', '')).strip()
                else:
                    c_name = str(company).strip()
                if c_name:
                    candidates.append(c_name)

        for c in candidates:
            companies_by_type[bucket].append(c)

    for label, lst in companies_by_type.items():
        # deduplicate, case-insensitive
        deduped = []
        seen = set()
        for c in lst:
            k = c.lower()
            if k and k not in seen:
                seen.add(k)
                deduped.append(c)
        companies_by_type[label] = sorted(deduped)

    return companies_by_type

def find_agents(request):
    # 1. Capture location from request into session if provided
    if request.GET.get('pincode') or request.GET.get('location'):
        if request.GET.get('pincode'):
            request.session['last_pincode'] = request.GET.get('pincode')
        if request.GET.get('location'):
            request.session['last_location'] = request.GET.get('location')
        
        # Clean up old GPS memory
        for key in ['last_lat', 'last_lng', 'detected_area']:
            if key in request.session:
                del request.session[key]
                
    elif request.GET.get('lat') and request.GET.get('lng'):
        request.session['last_lat'] = request.GET.get('lat')
        request.session['last_lng'] = request.GET.get('lng')
        # Clean up old Pincode/Location memory
        for key in ['last_pincode', 'last_location', 'pincode', 'location', 'detected_area']:
            if key in request.session:
                del request.session[key]

    # 2. Redirect to clean URL for non-HTMX requests to avoid breaking AJAX flows
    is_htmx = request.headers.get('HX-Request') == 'true'
    is_htmx_boosted = request.headers.get('HX-Boosted') == 'true'
    
    if (request.GET.get('pincode') or request.GET.get('location') or request.GET.get('lat')) and not is_htmx:
        query_dict = request.GET.copy()
        for k in ['pincode', 'lat', 'lng', 'location']:
            if k in query_dict:
                del query_dict[k]
        url = request.path
        if query_dict:
            url += '?' + query_dict.urlencode()
        return redirect(url)

    # 3. Get session data
    req_pincode = request.session.get('last_pincode', '')
    req_location = request.session.get('last_location', '')
    req_lat = request.session.get('last_lat', '')
    req_lng = request.session.get('last_lng', '')
    
    detected_area = request.session.get('detected_area', '')

    is_admin = False
    if request.user.is_authenticated and getattr(request.user, 'is_staff', False):
        is_admin = True
        
    should_gate_guest = False

    service_type = request.GET.get('ServiceType', '')
    
    has_any_filter = bool(
        request.GET.get('ServiceType') or
        request.GET.get('InsuranceType') or
        request.GET.get('InsuranceCompany') or
        request.GET.get('ComplaintType') or
        request.GET.get('search')
    )

    policy_review_needs_type = (service_type == 'Policy Review' and not request.GET.get('InsuranceType'))
    new_policy_needs_type = (service_type == 'New Policy' and not request.GET.get('InsuranceType'))
    claim_assistance_needs_type = (service_type == 'Claim Assistance' and not request.GET.get('InsuranceType'))
    no_service_type = (service_type == '')

    should_require_filter_selection = (
        not has_any_filter or
        no_service_type or
        policy_review_needs_type or
        new_policy_needs_type or
        claim_assistance_needs_type
    ) and not is_admin

    filter_prompt_message = 'Please select at least one filter (Service Type, Insurance Type, or Insurance Company), then click Apply.'
    if no_service_type:
        filter_prompt_message = 'Please select a Service Type and an Insurance Type, then click Apply.'
    elif new_policy_needs_type:
        filter_prompt_message = 'For New Policy, please select an Insurance Type and click Apply.'
    elif claim_assistance_needs_type:
        filter_prompt_message = 'For Claim Assistance, please select an Insurance Type and click Apply.'
    elif policy_review_needs_type:
        filter_prompt_message = 'For Policy Review, please select at least one Insurance Type and click Apply.'

    portfolio_companies_by_type = get_portfolio_companies_by_type()

    if should_require_filter_selection:
        context = {
            'agents': [],
            'shouldGateGuest': should_gate_guest,
            'shouldRequireFilterSelection': should_require_filter_selection,
            'filterPromptMessage': filter_prompt_message,
            'portfolioCompaniesByType': portfolio_companies_by_type,
            'detectedArea': detected_area,
            'request': request
        }
        if is_htmx and not is_htmx_boosted:
            return render(request, 'layouts/partials/find-agents-list.html', context)
        return render(request, 'find-agents.html', context)

    # Begin Base Query
    query = Agent.objects.filter(
        status='active',
        user__role='agent'
    ).select_related('profile', 'user').prefetch_related(
        'insurance_segments', 'performance_stats', 'active_subscription'
    )

    type_mapping = {
        'Health Insurance': 'health', 'Health': 'health',
        'Life Insurance': 'life', 'Life': 'life',
        'Motor Insurance': 'motor', 'Motor': 'motor',
        'SME Insurance': 'sme', 'SME': 'sme',
        'Travel Insurance': 'travel', 'Travel': 'travel',
        'Fire Insurance': 'fire', 'Fire': 'fire',
        'Marine Insurance': 'marine', 'Marine': 'marine',
        'Liability Insurance': 'liability', 'Liability': 'liability',
        'Other General Insurance': 'other',
        'Transport': 'transport',
        'Workmen Compensation': 'workmen_compensation',
        'GPA / GMC': 'gpa_gmc',
        'Group Term Insurance': 'group_term',
        'Cyber': 'cyber'
    }

    # Filter Insurance Type
    db_types = []
    insurance_types_param = request.GET.getlist('InsuranceType') or request.GET.getlist('InsuranceType[]')
    if insurance_types_param:
        for t in insurance_types_param:
            mapped = type_mapping.get(t, str(t).replace(' Insurance', '').lower())
            db_types.append(mapped)
        query = query.filter(insurance_segments__segment_type__in=db_types)

    # Filter Service Type
    if service_type:
        service_q = Q(lead_preferences__isnull=True)
        
        # Agents specialized in segments
        if db_types:
            service_q |= Q(insurance_segments__segment_type__in=db_types)
            
        if service_type == 'New Policy':
            service_q |= Q(lead_preferences__leads_new_business=True)
        elif service_type == 'Claim Assistance':
            service_q |= Q(lead_preferences__leads_claims_support=True)
        elif service_type == 'Policy Review':
            service_q |= Q(lead_preferences__leads_portfolio_analysis=True)
            
        query = query.filter(service_q).distinct()

    # Filter Location (city/state string)
    if req_location:
        query = query.filter(
            Q(profile__city__icontains=req_location) |
            Q(profile__state__icontains=req_location) |
            Q(serviceable_cities__name__icontains=req_location)
        ).distinct()

    # Filter Company
    ins_company = request.GET.get('InsuranceCompany')
    if ins_company:
        if service_type == 'New Policy':
            # Expert in product
            prod_q = Q(product_expertise__product_name=ins_company)
            if db_types:
                prod_q &= Q(product_expertise__segment_type__in=db_types)
            query = query.filter(prod_q).distinct()
        else:
            # Check JSON portfolios. Django JSONField querying
            port_q = Q(
                portfolios__primary_companies__name=ins_company
            ) | Q(
                portfolios__secondary_companies__name=ins_company
            )
            # MySQL JSON_EXTRACT secondary_companies->'$.companies[*].name' is harder in Django ORM directly.
            # Using icontains on the JSON text as a fallback since exact json array search requires raw SQL
            port_q |= Q(portfolios__secondary_companies__icontains=f'"name": "{ins_company}"')
            
            if db_types:
                port_q &= Q(portfolios__segment_type__in=db_types)
            query = query.filter(port_q).distinct()

    # Generic Search
    search = request.GET.get('search')
    if search:
        query = query.filter(
            Q(fullname__icontains=search) |
            Q(profile__city__icontains=search) |
            Q(profile__state__icontains=search)
        ).distinct()

    user_lat = req_lat
    user_lng = req_lng
    invalid_pincode = False

    # Fallback Pincode coordinates
    if not user_lat and not user_lng and req_pincode:
        if len(req_pincode) != 6 or not req_pincode.isdigit():
            invalid_pincode = True
        else:
            pincode_obj = Pincode.objects.filter(pincode=req_pincode).first()
            if pincode_obj and pincode_obj.latitude and pincode_obj.longitude:
                user_lat = float(pincode_obj.latitude)
                user_lng = float(pincode_obj.longitude)
            else:
                invalid_pincode = True

    if req_pincode and invalid_pincode:
        query = query.none()

    # Resolve detected area
    if user_lat and user_lng and not detected_area:
        try:
            u_lat = float(user_lat)
            u_lng = float(user_lng)
            
            # Using Haversine formula in Django ORM
            pincode_match = Pincode.objects.annotate(
                distance=ExpressionWrapper(
                    6371 * ACos(
                        Cos(Radians(u_lat)) * Cos(Radians(F('latitude'))) *
                        Cos(Radians(F('longitude')) - Radians(u_lng)) +
                        Sin(Radians(u_lat)) * Sin(Radians(F('latitude')))
                    ),
                    output_field=FloatField()
                )
            ).order_by('distance').first()

            if pincode_match and pincode_match.distance < 50:
                detected_area = pincode_match.office_name or pincode_match.district
                request.session['detected_area'] = detected_area
        except Exception as e:
            logger.error(f"Error resolving coordinates: {e}")

    if not detected_area and req_pincode:
        detected_area = f"PIN: {req_pincode}"

    # --- ADVANCED SORTING LOGIC ---

    # 1. Base query requires annotations for Padosi Smart Rank
    # We will use Django conditional expressions to recreate the scoring

    # Calculate average rating
    avg_rating_subquery = AgentReview.objects.filter(
        agent_id=OuterRef('pk'), is_approved=True
    ).values('agent_id').annotate(avg_r=Avg('rating')).values('avg_r')

    # Filter match count
    if db_types:
        from apps.agents.models import AgentInsuranceSegment
        filter_match_subq = AgentInsuranceSegment.objects.filter(
            agent_id=OuterRef('pk'),
            segment_type__in=db_types
        ).values('agent_id').annotate(c=Count('id')).values('c')
    else:
        filter_match_subq = Value(0, output_field=IntegerField())

    now = timezone.now()

    query = query.annotate(
        exp_score=Case(
            When(profile__license_number__isnull=False, then=Value(20)),
            default=Value(0),
            output_field=FloatField()
        ),
        client_score=Case(
            When(client_base__gte=500, then=Value(20)),
            default=Cast(Coalesce(F('client_base'), 0) / 500.0 * 20.0, FloatField()),
            output_field=FloatField()
        ),
        claims_score=Case(
            When(performance_stats__claims_processed__gte=100, then=Value(20)),
            default=Cast(Coalesce(F('performance_stats__claims_processed'), 0) / 100.0 * 20.0, FloatField()),
            output_field=FloatField()
        ),
        badge_score=Case(
            When(~Q(badge='') & ~Q(badge='none') & Q(badge__isnull=False), then=Value(15)),
            default=Value(0),
            output_field=FloatField()
        ),
        rating_val=Subquery(avg_rating_subquery, output_field=FloatField()),
    )

    query = query.annotate(
        rating_score=Case(
            When(rating_val__gte=4.5, then=Value(10)),
            default=Value(0),
            output_field=FloatField()
        ),
        # Assuming last_login_at is on user model
        days_since_login=ExtractDay(now - F('user__last_login')),
    ).annotate(
        activity_score=Case(
            When(days_since_login__lte=3, then=Value(50)),
            When(days_since_login__lte=14, then=Value(25)),
            When(days_since_login__lte=30, then=Value(10)),
            default=Value(0),
            output_field=FloatField()
        ),
        profile_completion=(
            Case(When(profile__profile_photo_path__isnull=False, then=1), default=0) +
            Case(When(profile__address__isnull=False, then=1), default=0) +
            Case(When(profile__license_number__isnull=False, then=1), default=0) +
            Case(When(profile__whatsapp__isnull=False, then=1), default=0) +
            Case(When(profile__license_number__isnull=False, then=1), default=0) +
            Case(When(profile__languages__isnull=False, then=1), default=0)
        ) * 5,
        filter_match=Subquery(filter_match_subq, output_field=IntegerField()) if db_types else filter_match_subq
    ).annotate(
        padosi_smart_rank=(
            F('exp_score') + F('client_score') + F('claims_score') + F('badge_score') +
            F('rating_score') + F('activity_score') + Cast(F('profile_completion'), FloatField()) +
            Cast(Coalesce(F('filter_match'), 0) * 30, FloatField())
        )
    )

    # Order by Padosi Smart Rank
    query = query.order_by('-padosi_smart_rank', '-created_at')

    # Distance calculation via DB if possible, but Laravel did it in PHP for precision
    agents_list = list(query[:200]) # Get top 200 agents to calculate distance locally

    if user_lat and user_lng:
        u_lat = float(user_lat)
        u_lng = float(user_lng)
        
        filtered_agents = []
        for agent in agents_list:
            a_lat = None
            a_lng = None
            
            # Pincode extraction logic
            service_pincodes = agent.profile.service_pincodes if agent.profile else []
            if service_pincodes and isinstance(service_pincodes, list):
                first_pin = service_pincodes[0]
                pin_obj = Pincode.objects.filter(pincode=first_pin).first()
                if pin_obj and pin_obj.latitude:
                    a_lat = float(pin_obj.latitude)
                    a_lng = float(pin_obj.longitude)
                    
            if a_lat and a_lng:
                # Haversine in python
                dLat = math.radians(a_lat - u_lat)
                dLng = math.radians(a_lng - u_lng)
                a = math.sin(dLat/2)**2 + math.cos(math.radians(u_lat)) * math.cos(math.radians(a_lat)) * math.sin(dLng/2)**2
                c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
                distance = 6371 * c
                agent.distance = distance
            else:
                agent.distance = 999999
                
        # Sort by distance
        agents_list.sort(key=lambda x: getattr(x, 'distance', 999999))
        
        # Filter within 50km
        agents_list = [a for a in agents_list if getattr(a, 'distance', 999999) <= 50]

    # Pagination
    page = request.GET.get('page', 1)
    paginator = Paginator(agents_list, 50)
    try:
        agents = paginator.page(page)
    except Exception:
        agents = paginator.page(1)

    context = {
        'agents': agents,
        'shouldGateGuest': should_gate_guest,
        'shouldRequireFilterSelection': should_require_filter_selection,
        'filterPromptMessage': filter_prompt_message,
        'portfolioCompaniesByType': portfolio_companies_by_type,
        'detectedArea': detected_area,
        'request': request
    }

    if is_htmx and not is_htmx_boosted:
        return render(request, 'layouts/partials/find-agents-list.html', context)
    return render(request, 'find-agents.html', context)

