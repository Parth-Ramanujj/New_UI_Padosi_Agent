from django.contrib import admin
from .models import (
    InsuranceCompany, City, Agent, AgentUserType, AgentInsuranceCompany,
    AgentServiceableCity, AgentProfile, AgentSubscription, AgentLead,
    AgentLeadPreference, AgentReview, AgentPerformanceStat, AgentProfileView,
    AgentPortfolio, AgentFamilyLicense, AgentInsuranceSegment,
    AgentProductExpertise, AgentAchievementPhoto, AgentCareerTimeline,
    AgentDeviceToken
)

# Inline Models for Agent
class AgentProfileInline(admin.StackedInline):
    model = AgentProfile
    extra = 0
    can_delete = False
    
class AgentSubscriptionInline(admin.TabularInline):
    model = AgentSubscription
    extra = 0

class AgentServiceableCityInline(admin.TabularInline):
    model = AgentServiceableCity
    extra = 0

@admin.register(Agent)
class AgentAdmin(admin.ModelAdmin):
    list_display = ('id', 'fullname', 'email', 'mobile', 'status', 'plan_type', 'registration_step')
    list_filter = ('status', 'plan_type')
    search_fields = ('fullname', 'email', 'mobile')
    ordering = ('-created_at',)
    inlines = [AgentProfileInline, AgentSubscriptionInline, AgentServiceableCityInline]
    
    actions = ['approve_agents', 'suspend_agents']
    
    def approve_agents(self, request, queryset):
        queryset.update(status='approved')
    approve_agents.short_description = "Approve selected agents"
    
    def suspend_agents(self, request, queryset):
        queryset.update(status='suspended')
    suspend_agents.short_description = "Suspend selected agents"

@admin.register(AgentProfile)
class AgentProfileAdmin(admin.ModelAdmin):
    list_display = ('agent', 'display_name', 'state', 'has_pos_license')
    search_fields = ('agent__fullname', 'agent__email')

@admin.register(AgentLead)
class AgentLeadAdmin(admin.ModelAdmin):
    list_display = ('id', 'agent', 'customer_name', 'interaction_type', 'lead_status', 'created_at')
    list_filter = ('lead_status', 'interaction_type')
    search_fields = ('customer_name', 'customer_email', 'customer_mobile', 'agent__fullname')
    ordering = ('-created_at',)

@admin.register(AgentReview)
class AgentReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'agent', 'reviewer_name', 'rating', 'is_approved', 'created_at')
    list_filter = ('is_approved', 'rating')
    search_fields = ('reviewer_name', 'agent__fullname')
    actions = ['approve_reviews', 'reject_reviews']

    def approve_reviews(self, request, queryset):
        queryset.update(is_approved=True)
    approve_reviews.short_description = "Approve selected reviews"

    def reject_reviews(self, request, queryset):
        queryset.update(is_approved=False)
    reject_reviews.short_description = "Reject selected reviews"

@admin.register(AgentSubscription)
class AgentSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('agent', 'selected_plan', 'registration_amount', 'starts_at', 'expires_at', 'status')
    list_filter = ('selected_plan', 'status', 'payment_status')
    search_fields = ('agent__fullname', 'razorpay_payment_id')

# Registering remaining models with basic configs
admin.site.register(InsuranceCompany)
admin.site.register(City)
admin.site.register(AgentUserType)
admin.site.register(AgentInsuranceCompany)
admin.site.register(AgentLeadPreference)
admin.site.register(AgentPerformanceStat)
admin.site.register(AgentProfileView)
admin.site.register(AgentPortfolio)
admin.site.register(AgentFamilyLicense)
admin.site.register(AgentInsuranceSegment)
admin.site.register(AgentProductExpertise)
admin.site.register(AgentAchievementPhoto)
admin.site.register(AgentCareerTimeline)
admin.site.register(AgentDeviceToken)
