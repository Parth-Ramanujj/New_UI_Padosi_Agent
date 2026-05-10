from rest_framework import serializers
from .models import (
    Agent, AgentProfile, AgentPerformanceStat, 
    AgentInsuranceSegment, AgentPortfolio, AgentProductExpertise, AgentReview
)

class AgentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgentProfile
        fields = [
            'display_name', 'address', 'office_address', 'service_pincode',
            'languages', 'whatsapp', 'website_url', 'social_links',
            'profile_photo_path'
        ]

class AgentPerformanceStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgentPerformanceStat
        fields = ['claims_processed', 'claims_settled', 'claims_amount', 'success_rate', 'response_time']

class AgentInsuranceSegmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgentInsuranceSegment
        fields = ['segment_type']

class AgentProductExpertiseSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgentProductExpertise
        fields = ['segment_type', 'product_name', 'expertise_level', 'is_custom']

class AgentReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgentReview
        fields = ['id', 'reviewer_name', 'rating', 'review', 'created_at']

class AgentDetailSerializer(serializers.ModelSerializer):
    profile = AgentProfileSerializer(read_only=True)
    performance_stats = AgentPerformanceStatSerializer(read_only=True)
    insurance_segments = AgentInsuranceSegmentSerializer(many=True, read_only=True)
    product_expertise = AgentProductExpertiseSerializer(many=True, read_only=True)
    recent_reviews = serializers.SerializerMethodField()
    
    class Meta:
        model = Agent
        fields = [
            'id', 'fullname', 'email', 'mobile',
            'experience_range', 'client_base', 'average_rating', 'review_count',
            'profile', 'performance_stats', 'insurance_segments', 'product_expertise',
            'recent_reviews'
        ]

    def get_recent_reviews(self, obj):
        reviews = AgentReview.objects.filter(agent=obj, is_approved=True).order_by('-created_at')[:5]
        return AgentReviewSerializer(reviews, many=True).data

class AgentListSerializer(serializers.ModelSerializer):
    profile = AgentProfileSerializer(read_only=True)
    
    class Meta:
        model = Agent
        fields = [
            'id', 'fullname', 'experience_range', 
            'average_rating', 'review_count', 'profile'
        ]
