from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .models import Agent, AgentReview
from .serializers import AgentListSerializer, AgentDetailSerializer, AgentReviewSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

class AgentListAPIView(generics.ListAPIView):
    """
    Public API to list and search agents.
    Supports filtering and searching by name, location, and segments.
    """
    queryset = Agent.objects.filter(status='active')
    serializer_class = AgentListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['fullname', 'profile__service_pincode', 'profile__address']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

class AgentDetailAPIView(generics.RetrieveAPIView):
    """
    Public API to retrieve full details of an agent via their slug.
    """
    queryset = Agent.objects.filter(status='active')
    serializer_class = AgentDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'profile__slug'

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def submit_review_api(request, profile_slug):
    """
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
            is_approved=False  # Require moderation by default
        )
        return Response({
            'message': 'Review submitted successfully and is pending approval.',
            'data': AgentReviewSerializer(review).data
        }, status=status.HTTP_201_CREATED)
        
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MyAgentProfileAPIView(generics.RetrieveUpdateAPIView):
    """
    Protected API for an agent to view and update their own profile.
    """
    serializer_class = AgentDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Assume user is linked to agent via user.agent or similar (depends on exact model linkage)
        return getattr(self.request.user, 'agent_profile_link', Agent.objects.filter(user_id=self.request.user.id).first())
