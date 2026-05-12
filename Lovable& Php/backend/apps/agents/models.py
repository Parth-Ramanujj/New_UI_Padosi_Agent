"""
PadosiAgent — Agents Models (Module 2)
Converted from Laravel Eloquent models. All use managed=False.
"""

import json
import logging
from django.db import models, connection
from django.utils import timezone
from django.utils.text import slugify
from apps.accounts.models import User, UserType

logger = logging.getLogger(__name__)


# =============================================================================
# INSURANCE COMPANY  (from app/Models/InsuranceCompany.php)
# Table: insurance_companies
# =============================================================================
class InsuranceCompany(models.Model):
    slug = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'insurance_companies'

    def __str__(self):
        return self.name


# =============================================================================
# CITY  (from app/Models/City.php)
# Table: cities
# =============================================================================
class City(models.Model):
    name = models.CharField(max_length=255)
    state = models.CharField(max_length=255, blank=True, null=True)
    slug = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'cities'

    def __str__(self):
        return self.name


# =============================================================================
# AGENT  (from app/Models/Agent.php)
# Table: agents
# =============================================================================
class Agent(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='agent_record', db_column='user_id',
    )
    fullname = models.CharField(max_length=255)
    email = models.EmailField(max_length=255)
    google_id = models.CharField(max_length=255, blank=True, null=True)
    email_verified_at = models.DateTimeField(blank=True, null=True)
    mobile = models.CharField(max_length=20, blank=True, null=True)
    # JSON columns — stored as text in MySQL, cast to list in Python
    user_types = models.JSONField(blank=True, null=True)
    insurance_companies = models.JSONField(blank=True, null=True)
    experience_range = models.CharField(max_length=50, blank=True, null=True)
    client_base = models.CharField(max_length=50, blank=True, null=True)
    achievement_photo_limit = models.IntegerField(blank=True, null=True)
    registration_step = models.IntegerField(default=0)
    status = models.CharField(max_length=50, default='incomplete')
    registration_draft = models.JSONField(blank=True, null=True)
    badge = models.CharField(max_length=255, blank=True, null=True)
    plan_type = models.CharField(max_length=50, blank=True, null=True)
    trial_ends_at = models.DateTimeField(blank=True, null=True)
    upgrade_discount_percent = models.FloatField(default=0)
    referred_by_code = models.CharField(max_length=100, blank=True, null=True)
    referral_reward_type = models.CharField(max_length=100, blank=True, null=True)
    referral_reward_claimed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # M2M relationships via pivot tables
    user_type_set = models.ManyToManyField(
        UserType, through='AgentUserType', related_name='agents',
    )
    insurance_company_set = models.ManyToManyField(
        InsuranceCompany, through='AgentInsuranceCompany',
        related_name='agents',
    )
    serviceable_city_set = models.ManyToManyField(
        City, through='AgentServiceableCity', related_name='agents',
    )

    class Meta:
        managed = False
        db_table = 'agents'

    def __str__(self):
        return f"{self.fullname} ({self.email})"

    # -- Business logic (from Agent.php) --
    def is_on_free_trial(self):
        return (
            self.plan_type == 'free_trial'
            and self.trial_ends_at
            and self.trial_ends_at > timezone.now()
        )

    def is_trial_expired(self):
        return (
            self.plan_type == 'free_trial'
            and self.trial_ends_at
            and self.trial_ends_at < timezone.now()
        )

    @property
    def average_rating(self):
        approved = self.reviews.filter(is_approved=True)
        avg = approved.aggregate(models.Avg('rating'))['rating__avg']
        return avg or 0

    @property
    def review_count(self):
        return self.reviews.filter(is_approved=True).count()

    # -- Dual-writing sync (from Agent::booted) --
    def sync_user_types(self):
        """Replicate Laravel's booted() dual-write for user_types."""
        types = self.user_types or []
        if isinstance(types, str):
            types = json.loads(types) if types else []
        type_ids = []
        for slug_val in types:
            if not slug_val:
                continue
            obj, _ = UserType.objects.get_or_create(
                slug=slug_val,
                defaults={'name': slug_val.replace('_', ' ').title()},
            )
            type_ids.append(obj.pk)
        self.user_type_set.set(type_ids)

    def sync_insurance_companies(self):
        """Replicate Laravel's booted() dual-write for insurance_companies."""
        companies = self.insurance_companies or []
        if isinstance(companies, str):
            companies = json.loads(companies) if companies else []
        comp_ids = []
        for name in companies:
            if not name:
                continue
            obj, _ = InsuranceCompany.objects.get_or_create(
                slug=slugify(name),
                defaults={'name': name},
            )
            comp_ids.append(obj.pk)
        self.insurance_company_set.set(comp_ids)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        try:
            self.sync_user_types()
        except Exception as e:
            logger.warning(f"sync_user_types failed: {e}")
        try:
            self.sync_insurance_companies()
        except Exception as e:
            logger.warning(f"sync_insurance_companies failed: {e}")


# =============================================================================
# PIVOT TABLES (managed=False through models)
# =============================================================================
class AgentUserType(models.Model):
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE, db_column='agent_id')
    user_type = models.ForeignKey(UserType, on_delete=models.CASCADE, db_column='user_type_id')

    class Meta:
        managed = False
        db_table = 'agent_user_type'


class AgentInsuranceCompany(models.Model):
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE, db_column='agent_id')
    insurance_company = models.ForeignKey(
        InsuranceCompany, on_delete=models.CASCADE,
        db_column='insurance_company_id',
    )

    class Meta:
        managed = False
        db_table = 'agent_insurance_company'


class AgentServiceableCity(models.Model):
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE, db_column='agent_id')
    city = models.ForeignKey(City, on_delete=models.CASCADE, db_column='city_id')

    class Meta:
        managed = False
        db_table = 'agent_serviceable_cities'


# =============================================================================
# AGENT PROFILE  (from app/Models/AgentProfile.php)
# Table: agent_profiles
# =============================================================================
class AgentProfile(models.Model):
    agent = models.OneToOneField(
        Agent, on_delete=models.CASCADE, related_name='profile',
        db_column='agent_id',
    )
    slug = models.CharField(max_length=255, blank=True, null=True)
    display_name = models.CharField(max_length=255, blank=True, null=True)
    profile_photo_path = models.TextField(blank=True, null=True)
    whatsapp = models.CharField(max_length=20, blank=True, null=True)
    languages = models.CharField(max_length=500, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    license_number = models.CharField(max_length=255, blank=True, null=True)
    pan_number = models.CharField(max_length=20, blank=True, null=True)
    agency_name = models.CharField(max_length=255, blank=True, null=True)
    office_address = models.TextField(blank=True, null=True)
    service_pincode = models.CharField(max_length=10, blank=True, null=True)
    has_pos_license = models.BooleanField(default=False)
    software_name = models.CharField(max_length=255, blank=True, null=True)
    website_url = models.URLField(max_length=500, blank=True, null=True)
    social_links = models.JSONField(blank=True, null=True)
    career_highlights = models.TextField(blank=True, null=True)
    portfolio_breakdown = models.JSONField(blank=True, null=True)
    desired_services = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'agent_profiles'

    def __str__(self):
        return f"Profile: {self.agent.fullname}"

    @property
    def profile_photo_url(self):
        """Replicate AgentProfile::getProfilePhotoUrlAttribute()."""
        path = self.profile_photo_path
        if not path:
            return None
        if path.startswith('http'):
            return path
        return path


# =============================================================================
# AGENT SUBSCRIPTION  (from app/Models/AgentSubscription.php)
# Table: agent_subscriptions
# =============================================================================
class AgentSubscription(models.Model):
    agent = models.ForeignKey(
        Agent, on_delete=models.CASCADE, related_name='subscriptions',
        db_column='agent_id',
    )
    selected_plan = models.CharField(max_length=255, blank=True, null=True)
    promo_code = models.CharField(max_length=100, blank=True, null=True)
    registration_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    razorpay_order_id = models.CharField(max_length=255, blank=True, null=True)
    razorpay_payment_id = models.CharField(max_length=255, blank=True, null=True)
    razorpay_signature = models.CharField(max_length=500, blank=True, null=True)
    payment_status = models.CharField(max_length=50, default='pending')
    status = models.CharField(max_length=50, default='inactive')
    starts_at = models.DateTimeField(blank=True, null=True)
    expires_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'agent_subscriptions'

    def __str__(self):
        return f"{self.agent.fullname} - {self.selected_plan}"


# =============================================================================
# AGENT LEAD  (from app/Models/AgentLead.php)
# Table: agent_leads
# =============================================================================
class AgentLead(models.Model):
    agent = models.ForeignKey(
        Agent, on_delete=models.CASCADE, related_name='leads',
        db_column='agent_id',
    )
    customer_name = models.CharField(max_length=255, blank=True, null=True)
    customer_email = models.EmailField(max_length=255, blank=True, null=True)
    customer_mobile = models.CharField(max_length=20, blank=True, null=True)
    customer_pincode = models.CharField(max_length=10, blank=True, null=True)
    interaction_type = models.CharField(max_length=50, blank=True, null=True)
    lead_status = models.CharField(max_length=50, default='new')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'agent_leads'

    def __str__(self):
        return f"Lead for {self.agent.fullname}: {self.customer_name}"


# =============================================================================
# AGENT LEAD PREFERENCE  (from app/Models/AgentLeadPreference.php)
# Table: agent_lead_preferences
# =============================================================================
class AgentLeadPreference(models.Model):
    agent = models.OneToOneField(
        Agent, on_delete=models.CASCADE, related_name='lead_preferences',
        db_column='agent_id',
    )
    leads_new_business = models.BooleanField(default=False)
    leads_portfolio_analysis = models.BooleanField(default=False)
    portfolio_charging = models.CharField(max_length=50, blank=True, null=True)
    portfolio_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    leads_claims_support = models.BooleanField(default=False)
    claims_charging = models.CharField(max_length=50, blank=True, null=True)
    claims_fee_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    claims_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'agent_lead_preferences'


# =============================================================================
# AGENT REVIEW  (from app/Models/AgentReview.php)
# Table: agent_reviews
# =============================================================================
class AgentReview(models.Model):
    agent = models.ForeignKey(
        Agent, on_delete=models.CASCADE, related_name='reviews',
        db_column='agent_id',
    )
    user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        db_column='user_id',
    )
    reviewer_name = models.CharField(max_length=255, blank=True, null=True)
    reviewer_email = models.EmailField(max_length=255, blank=True, null=True)
    reviewer_mobile = models.CharField(max_length=20, blank=True, null=True)
    rating = models.IntegerField(default=0)
    review = models.TextField(blank=True, null=True)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'agent_reviews'


# =============================================================================
# AGENT PERFORMANCE STAT  (from app/Models/AgentPerformanceStat.php)
# Table: agent_performance_stats
# =============================================================================
class AgentPerformanceStat(models.Model):
    agent = models.OneToOneField(
        Agent, on_delete=models.CASCADE, related_name='performance_stats',
        db_column='agent_id',
    )
    claims_processed = models.IntegerField(default=0)
    claims_settled = models.IntegerField(default=0)
    claims_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    success_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    response_time = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'agent_performance_stats'


# =============================================================================
# AGENT PROFILE VIEW  (from app/Models/AgentProfileView.php)
# Table: agent_profile_views
# =============================================================================
class AgentProfileView(models.Model):
    agent = models.ForeignKey(
        Agent, on_delete=models.CASCADE, related_name='profile_views',
        db_column='agent_id',
    )
    view_date = models.DateField()
    view_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'agent_profile_views'


# =============================================================================
# AGENT PORTFOLIO  (from app/Models/AgentPortfolio.php)
# Table: agent_portfolios
# =============================================================================
class AgentPortfolio(models.Model):
    agent = models.ForeignKey(
        Agent, on_delete=models.CASCADE, related_name='portfolios',
        db_column='agent_id',
    )
    segment_type = models.CharField(max_length=100)
    primary_companies = models.JSONField(blank=True, null=True)
    secondary_companies = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'agent_portfolios'


# =============================================================================
# AGENT FAMILY LICENSE  (from app/Models/AgentFamilyLicense.php)
# Table: agent_family_licenses
# =============================================================================
class AgentFamilyLicense(models.Model):
    agent = models.ForeignKey(
        Agent, on_delete=models.CASCADE, related_name='family_licenses',
        db_column='agent_id',
    )
    full_name = models.CharField(max_length=255)
    relationship = models.CharField(max_length=100, blank=True, null=True)
    license_number = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'agent_family_licenses'


# =============================================================================
# AGENT INSURANCE SEGMENT  (from app/Models/AgentInsuranceSegment.php)
# Table: agent_insurance_segments
# =============================================================================
class AgentInsuranceSegment(models.Model):
    agent = models.ForeignKey(
        Agent, on_delete=models.CASCADE, related_name='insurance_segments',
        db_column='agent_id',
    )
    segment_type = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'agent_insurance_segments'


# =============================================================================
# AGENT PRODUCT EXPERTISE  (from app/Models/AgentProductExpertise.php)
# Table: agent_product_expertise
# =============================================================================
class AgentProductExpertise(models.Model):
    agent = models.ForeignKey(
        Agent, on_delete=models.CASCADE, related_name='product_expertise',
        db_column='agent_id',
    )
    segment_type = models.CharField(max_length=100)
    product_name = models.CharField(max_length=255)
    expertise_level = models.IntegerField(default=0)
    is_custom = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'agent_product_expertise'


# =============================================================================
# AGENT ACHIEVEMENT PHOTO  (from app/Models/AgentAchievementPhoto.php)
# Table: agent_achievement_photos
# =============================================================================
class AgentAchievementPhoto(models.Model):
    agent = models.ForeignKey(
        Agent, on_delete=models.CASCADE, related_name='achievement_photos',
        db_column='agent_id',
    )
    photo_path = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'agent_achievement_photos'

    @property
    def photo_url(self):
        path = self.photo_path
        if not path:
            return None
        if path.startswith('http'):
            return path
        return path


class AgentCareerTimeline(models.Model):
    agent = models.ForeignKey(
        Agent, on_delete=models.CASCADE, related_name='career_timelines',
        db_column='agent_id',
    )
    event_type = models.CharField(max_length=100, blank=True, null=True)
    event_text = models.TextField(blank=True, null=True)
    month = models.CharField(max_length=20, blank=True, null=True)
    year = models.CharField(max_length=10, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'agent_career_timelines'


# =============================================================================
# AGENT DEVICE TOKEN  (from app/Models/AgentDeviceToken.php)
# Table: agent_device_tokens
# =============================================================================
class AgentDeviceToken(models.Model):
    agent = models.ForeignKey(
        Agent, on_delete=models.CASCADE, related_name='device_tokens',
        db_column='agent_id',
    )
    token = models.CharField(max_length=512)
    platform = models.CharField(max_length=50, blank=True, null=True)
    last_seen_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'agent_device_tokens'

# =============================================================================
# PROMO CODE MODEL
# Converted from: app/Models/PromoCode.php
# =============================================================================
class PromoCode(models.Model):
    code = models.CharField(max_length=255, unique=True)
    discount_type = models.CharField(max_length=50) # percentage, fixed
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    max_uses = models.IntegerField(null=True, blank=True)
    times_used = models.IntegerField(default=0)
    applicable_plan = models.CharField(max_length=255, null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_free_trial = models.BooleanField(default=False)
    trial_plan_name = models.CharField(max_length=255, null=True, blank=True)
    trial_duration_days = models.IntegerField(null=True, blank=True)
    trial_price_override = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'promo_codes'

# =============================================================================
# REFERRAL CODE MODEL
# Converted from: app/Models/ReferralCode.php
# =============================================================================
class ReferralCode(models.Model):
    agent = models.ForeignKey('Agent', on_delete=models.CASCADE, db_column='agent_id')
    code = models.CharField(max_length=255, unique=True)
    is_active = models.BooleanField(default=True)
    total_referrals = models.IntegerField(default=0)
    pending_referrals = models.IntegerField(default=0)
    reward_discount_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    reward_claimed = models.BooleanField(default=False)
    reward_type = models.CharField(max_length=255, null=True, blank=True)
    reward_claimed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'referral_codes'

# =============================================================================
# REFERRAL USAGE MODEL
# Converted from: app/Models/ReferralUsage.php
# =============================================================================
class ReferralUsage(models.Model):
    referral_code = models.ForeignKey(ReferralCode, on_delete=models.CASCADE, db_column='referral_code_id')
    referrer_agent = models.ForeignKey('Agent', on_delete=models.CASCADE, related_name='referrals_made', db_column='referrer_agent_id')
    referred_agent = models.ForeignKey('Agent', on_delete=models.CASCADE, related_name='referrals_received', db_column='referred_agent_id')
    referred_agent_name = models.CharField(max_length=255, null=True, blank=True)
    referred_agent_email = models.CharField(max_length=255, null=True, blank=True)
    referred_agent_mobile = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=50) # pending, converted
    signed_up_at = models.DateTimeField(null=True, blank=True)
    converted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'referral_usages'

# =============================================================================
# FREE TRIAL HISTORY MODEL
# Converted from: app/Models/FreeTrialHistory.php
# =============================================================================
class FreeTrialHistory(models.Model):
    agent = models.ForeignKey('Agent', on_delete=models.CASCADE, db_column='agent_id')
    promo_code_str = models.CharField(max_length=255, db_column='promo_code', null=True, blank=True)
    promo_code = models.ForeignKey(PromoCode, on_delete=models.SET_NULL, null=True, blank=True, db_column='promo_code_id')
    trial_plan_name = models.CharField(max_length=255, null=True, blank=True)
    trial_duration_days = models.IntegerField(null=True, blank=True)
    trial_price_paid = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount_type = models.CharField(max_length=50, null=True, blank=True)
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    referral_code = models.ForeignKey(ReferralCode, on_delete=models.SET_NULL, null=True, blank=True, db_column='referral_code_id')
    agent_name = models.CharField(max_length=255, null=True, blank=True)
    agent_email = models.CharField(max_length=255, null=True, blank=True)
    agent_mobile = models.CharField(max_length=255, null=True, blank=True)
    trial_started_at = models.DateTimeField(null=True, blank=True)
    trial_ends_at = models.DateTimeField(null=True, blank=True)
    source = models.CharField(max_length=255, null=True, blank=True)
    ip_address = models.CharField(max_length=45, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'free_trial_history'

# =============================================================================
# INVOICE MODEL
# Converted from: app/Models/Invoice.php
# =============================================================================
class Invoice(models.Model):
    invoice_number = models.CharField(max_length=255, unique=True)
    agent = models.ForeignKey('Agent', on_delete=models.CASCADE, db_column='agent_id')
    agent_name = models.CharField(max_length=255, null=True, blank=True)
    agent_email = models.CharField(max_length=255, null=True, blank=True)
    agent_mobile = models.CharField(max_length=255, null=True, blank=True)
    agent_address = models.TextField(null=True, blank=True)
    agent_state = models.CharField(max_length=255, null=True, blank=True)
    plan_name = models.CharField(max_length=255, null=True, blank=True)
    plan_type = models.CharField(max_length=255, null=True, blank=True)
    base_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    gst_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    promo_code = models.CharField(max_length=255, null=True, blank=True)
    discount_folder = models.CharField(max_length=255, null=True, blank=True)
    razorpay_payment_id = models.CharField(max_length=255, null=True, blank=True)
    razorpay_order_id = models.CharField(max_length=255, null=True, blank=True)
    payment_status = models.CharField(max_length=50, null=True, blank=True)
    pdf_path = models.CharField(max_length=255, null=True, blank=True)
    synced_to_sheet = models.BooleanField(default=False)
    synced_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'invoices'

# =============================================================================
# PROFILE LEAD MODEL
# Converted from: app/Models/ProfileLead.php
# =============================================================================
class ProfileLead(models.Model):
    agent = models.ForeignKey('Agent', on_delete=models.CASCADE, db_column='agent_id')
    name = models.CharField(max_length=255, null=True, blank=True)
    email = models.CharField(max_length=255, null=True, blank=True)
    mobile = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'profile_leads'

# =============================================================================
# FAVORITE AGENT MODEL
# Converted from: app/Models/FavoriteAgent.php
# =============================================================================
class FavoriteAgent(models.Model):
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, db_column='user_id')
    agent = models.ForeignKey('Agent', on_delete=models.CASCADE, db_column='agent_id')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'favorite_agents'
