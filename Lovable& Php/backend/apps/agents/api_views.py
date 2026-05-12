"""
PadosiAgent — Agents API Views (DRF)
REST API endpoints for agent operations.

Includes:
- AgentListAPIView — public agent listing
- AgentSearchAPIView — advanced search with filtering
- AgentDetailAPIView — public agent detail by slug
- MyAgentProfileAPIView — authenticated agent's own profile
- AgentDashboardAPIView — authenticated agent's dashboard stats
- AgentLeadsAPIView — authenticated agent's leads
- LeadCaptureAPIView — public lead submission
- submit_review_api — public review submission
"""

import logging
from django.db.models import Q, Avg, Count, Sum
from django.db.models.functions import Coalesce
from django.utils import timezone
from rest_framework import generics, permissions, status, serializers as drf_serializers
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import (
    Agent, AgentProfile, AgentReview, AgentLead,
    AgentProfileView, AgentInsuranceSegment, AgentPerformanceStat,
)
from .serializers import AgentListSerializer, AgentDetailSerializer, AgentReviewSerializer

logger = logging.getLogger(__name__)


# ─── Inline Serializers for new endpoints ────────────────────────────────────

class AgentSearchResultSerializer(drf_serializers.ModelSerializer):
    """Serializer for search results with extra computed fields."""
    profile_photo = drf_serializers.SerializerMethodField()
    display_name = drf_serializers.SerializerMethodField()
    city = drf_serializers.SerializerMethodField()
    segments = drf_serializers.SerializerMethodField()
    slug = drf_serializers.SerializerMethodField()

    class Meta:
        model = Agent
        fields = [
            'id', 'fullname', 'display_name', 'experience_range',
            'average_rating', 'review_count', 'profile_photo',
            'city', 'segments', 'slug', 'badge', 'client_base',
        ]

    def get_profile_photo(self, obj):
        profile = getattr(obj, 'profile', None)
        if profile and profile.profile_photo_path:
            return profile.profile_photo_path
        return None

    def get_display_name(self, obj):
        profile = getattr(obj, 'profile', None)
        if profile and profile.display_name:
            return profile.display_name
        return obj.fullname

    def get_city(self, obj):
        profile = getattr(obj, 'profile', None)
        if profile:
            return profile.address or profile.service_pincode or ''
        return ''

    def get_segments(self, obj):
        try:
            return list(obj.insurance_segments.values_list('segment_type', flat=True))
        except Exception:
            return []

    def get_slug(self, obj):
        profile = getattr(obj, 'profile', None)
        if profile and profile.slug:
            return profile.slug
        return str(obj.id)


class LeadCaptureSerializer(drf_serializers.Serializer):
    agent_id = drf_serializers.IntegerField()
    customer_name = drf_serializers.CharField(max_length=255)
    customer_email = drf_serializers.EmailField(required=False, allow_blank=True)
    customer_mobile = drf_serializers.CharField(max_length=20)
    customer_pincode = drf_serializers.CharField(max_length=10, required=False, allow_blank=True)
    interaction_type = drf_serializers.CharField(max_length=50, required=False, default='contact_request')


class LeadListSerializer(drf_serializers.ModelSerializer):
    class Meta:
        model = AgentLead
        fields = [
            'id', 'customer_name', 'customer_email', 'customer_mobile',
            'customer_pincode', 'interaction_type', 'lead_status',
            'notes', 'created_at', 'updated_at',
        ]


# ─── Views ───────────────────────────────────────────────────────────────────

class AgentListAPIView(generics.ListAPIView):
    """
    GET /api/agents/
    Public API to list active agents.
    """
    queryset = Agent.objects.filter(status='active').select_related('profile')
    serializer_class = AgentListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['fullname', 'profile__service_pincode', 'profile__address']
    ordering_fields = ['created_at']
    ordering = ['-created_at']


class AgentSearchAPIView(APIView):
    """
    GET /api/agents/search/
    Advanced agent search with filtering by:
      - service_type (New Policy, Claim Assistance, Policy Review)
      - insurance_type (health, life, motor, sme, travel, ...)
      - search (text search on name/city)
      - pincode / city
    """
    permission_classes = [permissions.AllowAny]

    TYPE_MAPPING = {
        'Health Insurance': 'health', 'Health': 'health',
        'Life Insurance': 'life', 'Life': 'life',
        'Motor Insurance': 'motor', 'Motor': 'motor',
        'SME Insurance': 'sme', 'SME': 'sme',
        'Travel Insurance': 'travel', 'Travel': 'travel',
        'Fire Insurance': 'fire', 'Fire': 'fire',
        'Marine Insurance': 'marine', 'Marine': 'marine',
        'home': 'fire',  # Home insurance maps to fire
    }

    def get(self, request):
        query = Agent.objects.filter(
            status='active',
        ).select_related('profile').prefetch_related('insurance_segments')

        # Text search
        search = request.query_params.get('search', '').strip()
        if search:
            query = query.filter(
                Q(fullname__icontains=search) |
                Q(profile__address__icontains=search) |
                Q(profile__display_name__icontains=search) |
                Q(profile__service_pincode__icontains=search)
            ).distinct()

        # Insurance type filter
        insurance_types = request.query_params.getlist('insurance_type')
        if not insurance_types:
            raw_type = request.query_params.get('insurance_type', '')
            if raw_type:
                insurance_types = [raw_type]

        db_types = []
        if insurance_types:
            for t in insurance_types:
                mapped = self.TYPE_MAPPING.get(t, t.lower().replace(' insurance', '').replace(' ', '_'))
                db_types.append(mapped)
            query = query.filter(insurance_segments__segment_type__in=db_types).distinct()

        # City/pincode filter
        city = request.query_params.get('city', '').strip()
        if city:
            query = query.filter(
                Q(profile__address__icontains=city) |
                Q(profile__service_pincode__icontains=city)
            ).distinct()

        pincode = request.query_params.get('pincode', '').strip()
        if pincode:
            query = query.filter(
                profile__service_pincode=pincode
            ).distinct()

        # Order by latest
        query = query.order_by('-created_at')

        # Pagination (simple)
        page_size = int(request.query_params.get('limit', 50))
        offset = int(request.query_params.get('offset', 0))
        total = query.count()
        agents = query[offset:offset + page_size]

        serializer = AgentSearchResultSerializer(agents, many=True)
        return Response({
            'results': serializer.data,
            'total': total,
            'limit': page_size,
            'offset': offset,
        })


class AgentDetailAPIView(generics.RetrieveAPIView):
    """
    GET /api/agents/<slug>/
    Public API to retrieve full details of an agent via their slug.
    """
    queryset = Agent.objects.filter(status='active')
    serializer_class = AgentDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'profile__slug'
    lookup_url_kwarg = 'profile_slug'

    def get_object(self):
        slug = self.kwargs['profile_slug']
        agent = Agent.objects.filter(profile__slug=slug).first()
        if not agent and slug.isdigit():
            agent = Agent.objects.filter(pk=int(slug)).first()
        if not agent:
            from rest_framework.exceptions import NotFound
            raise NotFound('Agent not found')
        return agent


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def submit_review_api(request, profile_slug):
    """
    POST /api/agents/<slug>/review/
    Public API endpoint to submit a review for an agent.
    """
    agent = Agent.objects.filter(profile__slug=profile_slug).first()
    if not agent:
        return Response({'error': 'Agent not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = AgentReviewSerializer(data=request.data)
    if serializer.is_valid():
        review = serializer.save(
            agent=agent,
            user=request.user if request.user.is_authenticated else None,
            is_approved=False
        )
        return Response({
            'message': 'Review submitted successfully and is pending approval.',
            'data': AgentReviewSerializer(review).data
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyAgentProfileAPIView(generics.RetrieveUpdateAPIView):
    """
    GET/PUT /api/agents/me/
    Protected API for an agent to view and update their own profile.
    """
    serializer_class = AgentDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        agent = Agent.objects.filter(user=self.request.user).first()
        if not agent:
            from rest_framework.exceptions import NotFound
            raise NotFound('Agent profile not found')
        return agent


class AgentDashboardAPIView(APIView):
    """
    GET /api/agents/me/dashboard/
    Returns dashboard statistics for the authenticated agent.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        agent = Agent.objects.filter(user=request.user).first()
        if not agent:
            return Response({'error': 'Agent not found'}, status=status.HTTP_404_NOT_FOUND)

        month_start = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        # Lead stats
        try:
            base_qs = AgentLead.objects.filter(agent=agent)
            total_leads = base_qs.count()
            monthly_leads = base_qs.filter(created_at__gte=month_start).count()
            new_leads = base_qs.filter(lead_status='new').count()
            contacted_leads = base_qs.filter(lead_status='contacted').count()
            follow_up_leads = base_qs.filter(lead_status='follow_up').count()
            closed_leads = base_qs.filter(lead_status='closed').count()
        except Exception:
            total_leads = monthly_leads = new_leads = contacted_leads = follow_up_leads = closed_leads = 0

        active_leads = new_leads + contacted_leads + follow_up_leads
        conversion_rate = round((closed_leads / total_leads) * 100, 1) if total_leads > 0 else 0

        # Profile view stats
        try:
            total_page_views = AgentProfileView.objects.filter(
                agent=agent
            ).aggregate(total=Coalesce(Sum('view_count'), 0))['total']
            monthly_visits = AgentProfileView.objects.filter(
                agent=agent, view_date__gte=month_start.date()
            ).aggregate(total=Coalesce(Sum('view_count'), 0))['total']
        except Exception:
            total_page_views = monthly_visits = 0

        # Recent leads
        try:
            recent_leads = list(AgentLead.objects.filter(agent=agent).order_by('-created_at')[:10])
        except Exception:
            recent_leads = []

        # Profile completion
        profile = AgentProfile.objects.filter(agent=agent).first()
        checks = [
            bool(profile and profile.profile_photo_path),
            bool(profile and profile.office_address),
            bool(agent.experience_range),
            bool(profile and profile.whatsapp),
            bool(profile and getattr(profile, 'license_number', None)),
            bool(profile and profile.languages),
        ]
        completion = round(sum(checks) / len(checks) * 100)

        # Plan info
        plan_labels = {'free_trial': 'Free Trial', 'starter': 'Starter', 'professional': 'Professional'}
        plan_name = plan_labels.get(agent.plan_type or '', 'Free Trial')
        is_on_trial = agent.is_on_free_trial()
        days_left = 0
        if is_on_trial and agent.trial_ends_at:
            delta = agent.trial_ends_at - timezone.now()
            days_left = max(0, delta.days)

        # Display helpers
        display_name = (profile.display_name if profile and profile.display_name else agent.fullname) or ''
        profile_photo = profile.profile_photo_path if profile else None

        # Segments
        try:
            segments = list(agent.insurance_segments.values_list('segment_type', flat=True))
        except Exception:
            segments = []

        return Response({
            'agent': {
                'id': agent.id,
                'fullname': agent.fullname,
                'email': agent.email,
                'display_name': display_name,
                'profile_photo': profile_photo,
                'plan_name': plan_name,
                'is_on_trial': is_on_trial,
                'days_left': days_left,
                'completion': completion,
                'badge': agent.badge,
                'segments': segments,
                'status': agent.status,
            },
            'stats': {
                'total_leads': total_leads,
                'monthly_leads': monthly_leads,
                'new_leads': new_leads,
                'contacted_leads': contacted_leads,
                'follow_up_leads': follow_up_leads,
                'closed_leads': closed_leads,
                'active_leads': active_leads,
                'conversion_rate': conversion_rate,
                'total_page_views': total_page_views,
                'monthly_visits': monthly_visits,
            },
            'recent_leads': LeadListSerializer(recent_leads, many=True).data,
        })


class AgentLeadsAPIView(generics.ListAPIView):
    """
    GET /api/agents/me/leads/
    List leads for the authenticated agent.
    Supports filtering by ?status=new|contacted|follow_up|closed
    """
    serializer_class = LeadListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        agent = Agent.objects.filter(user=self.request.user).first()
        if not agent:
            return AgentLead.objects.none()

        qs = AgentLead.objects.filter(agent=agent).order_by('-created_at')
        status_filter = self.request.query_params.get('status', '').strip()
        if status_filter:
            qs = qs.filter(lead_status=status_filter)
        return qs


class LeadCaptureAPIView(APIView):
    """
    POST /api/agents/leads/capture/
    Public endpoint for capturing a lead from the frontend.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LeadCaptureSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        agent_id = serializer.validated_data['agent_id']
        agent = Agent.objects.filter(pk=agent_id).first()
        if not agent:
            return Response({'error': 'Agent not found'}, status=status.HTTP_404_NOT_FOUND)

        lead = AgentLead.objects.create(
            agent=agent,
            customer_name=serializer.validated_data['customer_name'],
            customer_email=serializer.validated_data.get('customer_email', ''),
            customer_mobile=serializer.validated_data['customer_mobile'],
            customer_pincode=serializer.validated_data.get('customer_pincode', ''),
            interaction_type=serializer.validated_data.get('interaction_type', 'contact_request'),
            lead_status='new',
        )

        return Response({
            'message': 'Lead captured successfully',
            'lead_id': lead.id,
        }, status=status.HTTP_201_CREATED)
