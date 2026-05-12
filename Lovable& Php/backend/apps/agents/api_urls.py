"""
PadosiAgent — Agents API URL Configuration
REST API endpoints for agent operations.

Prefix: /api/agents/
"""

from django.urls import path
from . import api_views

app_name = 'agents_api'

urlpatterns = [
    # Public agent listing & search
    path('', api_views.AgentListAPIView.as_view(), name='agent_list'),
    path('search/', api_views.AgentSearchAPIView.as_view(), name='agent_search'),

    # Authenticated agent's own profile & dashboard
    path('me/', api_views.MyAgentProfileAPIView.as_view(), name='my_profile'),
    path('me/dashboard/', api_views.AgentDashboardAPIView.as_view(), name='my_dashboard'),
    path('me/leads/', api_views.AgentLeadsAPIView.as_view(), name='my_leads'),

    # Lead capture (public)
    path('leads/capture/', api_views.LeadCaptureAPIView.as_view(), name='lead_capture'),

    # Public agent detail & review
    path('<str:profile_slug>/', api_views.AgentDetailAPIView.as_view(), name='agent_detail'),
    path('<str:profile_slug>/review/', api_views.submit_review_api, name='submit_review'),
]
