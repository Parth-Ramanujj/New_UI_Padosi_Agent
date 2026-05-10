from django.urls import path
from . import api_views

app_name = 'agents_api'

urlpatterns = [
    path('', api_views.AgentListAPIView.as_view(), name='agent_list'),
    path('me/', api_views.MyAgentProfileAPIView.as_view(), name='my_profile'),
    path('<str:profile_slug>/', api_views.AgentDetailAPIView.as_view(), name='agent_detail'),
    path('<str:profile_slug>/review/', api_views.submit_review_api, name='submit_review'),
]
