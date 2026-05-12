import json
from django.db import models

class SiteSetting(models.Model):
    key = models.CharField(max_length=255, unique=True)
    value = models.TextField(null=True, blank=True)
    group = models.CharField(max_length=50, default='general')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'site_settings'

    @classmethod
    def get_value(cls, key, default=None):
        try:
            setting = cls.objects.get(key=key)
            val = setting.value
            if not val:
                return default
            # Attempt to parse as JSON
            val_str = str(val).strip()
            if val_str.startswith('{') or val_str.startswith('['):
                try:
                    return json.loads(val_str)
                except json.JSONDecodeError:
                    pass
            return val
        except cls.DoesNotExist:
            return default

    def __str__(self):
        return self.key


class ContactSubmission(models.Model):
    reference_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    mobile = models.CharField(max_length=20)
    email = models.EmailField(max_length=100)
    company = models.CharField(max_length=100, null=True, blank=True)
    subject = models.CharField(max_length=100)
    message = models.TextField()
    status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'contact_submissions'

    @classmethod
    def generate_reference_id(cls):
        import uuid
        return f"CONTACT_{uuid.uuid4().hex[:8].upper()}"

    def __str__(self):
        return f"{self.reference_id} - {self.name}"


class Participant(models.Model):
    PARTICIPANT_SHARED_CHOICES = [
        ('Yes', 'Yes'),
        ('No', 'No'),
    ]
    
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20)
    have_insurance = models.CharField(max_length=10)
    insurance_products = models.JSONField(null=True, blank=True)
    insurance_planning = models.TextField(null=True, blank=True)
    mutual_fund = models.CharField(max_length=10)
    mf_plan = models.TextField(null=True, blank=True)
    thank_my_padosi = models.CharField(max_length=255, null=True, blank=True)
    thank_my_padosi_for = models.TextField(null=True, blank=True)
    participant_shared = models.CharField(max_length=10, choices=PARTICIPANT_SHARED_CHOICES, default='No')
    shareable_id = models.CharField(max_length=100, null=True, blank=True)
    registration_completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'participants'

    def __str__(self):
        return self.full_name


class Pincode(models.Model):
    pincode = models.CharField(max_length=10, unique=True)
    office_name = models.CharField(max_length=255, null=True, blank=True)
    district = models.CharField(max_length=255, null=True, blank=True)
    state = models.CharField(max_length=255, null=True, blank=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'pincodes'

    def __str__(self):
        return self.pincode

# =============================================================================
# PAGE MODEL
# Converted from: app/Models/Page.php
# =============================================================================
class Page(models.Model):
    title = models.CharField(max_length=255)
    slug = models.CharField(max_length=255, unique=True)
    content = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'pages'
