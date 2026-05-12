"""
PadosiAgent — Agent Forms (Module 4)
Covers: review submission, lead capture, profile update steps, lead status.
"""
from django import forms
from .models import AgentProfile, AgentReview, AgentLead


# ---------------------------------------------------------------------------
# Review Form
# ---------------------------------------------------------------------------
class AgentReviewForm(forms.ModelForm):
    """Form to submit or update a review for an agent."""
    class Meta:
        model  = AgentReview
        fields = ['reviewer_name', 'reviewer_email', 'reviewer_mobile', 'rating', 'review']
        widgets = {
            'review': forms.Textarea(attrs={
                'rows': 4,
                'placeholder': 'Write your review here...',
                'class': 'form-control',
            }),
            'rating': forms.NumberInput(attrs={
                'min': 1, 'max': 5, 'class': 'form-control',
            }),
            'reviewer_name':   forms.TextInput(attrs={'class': 'form-control'}),
            'reviewer_email':  forms.EmailInput(attrs={'class': 'form-control'}),
            'reviewer_mobile': forms.TextInput(attrs={'class': 'form-control'}),
        }

    def clean_rating(self):
        rating = self.cleaned_data.get('rating')
        if rating is not None and not (1 <= rating <= 5):
            raise forms.ValidationError('Rating must be between 1 and 5.')
        return rating


# ---------------------------------------------------------------------------
# Lead Capture Form  (public profile → agent)
# ---------------------------------------------------------------------------
class AgentLeadForm(forms.ModelForm):
    """Capture a new lead from the public profile page."""
    class Meta:
        model  = AgentLead
        fields = [
            'customer_name', 'customer_email', 'customer_mobile',
            'customer_pincode', 'interaction_type',
        ]
        widgets = {
            'customer_name':    forms.TextInput(attrs={'class': 'form-control'}),
            'customer_email':   forms.EmailInput(attrs={'class': 'form-control'}),
            'customer_mobile':  forms.TextInput(attrs={'class': 'form-control'}),
            'customer_pincode': forms.TextInput(attrs={'class': 'form-control', 'maxlength': '6'}),
            'interaction_type': forms.Select(
                choices=[
                    ('', 'Select Type'),
                    ('new_business',       'New Business'),
                    ('portfolio_analysis', 'Portfolio Analysis'),
                    ('claims_support',     'Claims Support'),
                    ('general_enquiry',    'General Enquiry'),
                ],
                attrs={'class': 'form-control'},
            ),
        }

    def clean_customer_mobile(self):
        mobile = self.cleaned_data.get('customer_mobile', '')
        digits = ''.join(c for c in mobile if c.isdigit())
        if len(digits) < 10:
            raise forms.ValidationError('Enter a valid 10-digit mobile number.')
        return mobile


# ---------------------------------------------------------------------------
# Lead Status Update Form  (agent dashboard)
# ---------------------------------------------------------------------------
class LeadStatusForm(forms.ModelForm):
    """Update lead status and notes from the agent dashboard."""
    class Meta:
        model  = AgentLead
        fields = ['lead_status', 'notes']
        widgets = {
            'lead_status': forms.Select(
                choices=[
                    ('new',        'New'),
                    ('contacted',  'Contacted'),
                    ('follow_up',  'Follow-up'),
                    ('closed',     'Closed'),
                ],
                attrs={'class': 'form-control'},
            ),
            'notes': forms.Textarea(attrs={
                'rows': 3,
                'class': 'form-control',
                'placeholder': 'Add notes about this lead...',
            }),
        }


# ---------------------------------------------------------------------------
# Profile Step Forms
# ---------------------------------------------------------------------------
class AgentProfileBasicForm(forms.ModelForm):
    """Step 1 — Basic Info (profile fields)."""
    class Meta:
        model  = AgentProfile
        fields = ['display_name', 'whatsapp', 'languages', 'address']
        widgets = {
            'display_name': forms.TextInput(attrs={'class': 'form-control'}),
            'whatsapp':     forms.TextInput(attrs={'class': 'form-control'}),
            'languages':    forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g. English, Hindi, Marathi',
            }),
            'address':      forms.Textarea(attrs={'rows': 3, 'class': 'form-control'}),
        }


class AgentProfileProfessionalForm(forms.ModelForm):
    """Step 2 — Professional Info."""
    class Meta:
        model  = AgentProfile
        fields = [
            'pan_number', 'agency_name', 'office_address',
            'service_pincode', 'has_pos_license',
        ]
        widgets = {
            'pan_number':      forms.TextInput(attrs={'class': 'form-control', 'maxlength': '10'}),
            'agency_name':     forms.TextInput(attrs={'class': 'form-control'}),
            'office_address':  forms.Textarea(attrs={'rows': 3, 'class': 'form-control'}),
            'service_pincode': forms.TextInput(attrs={'class': 'form-control', 'maxlength': '6'}),
            'has_pos_license': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        }


class AgentProfileSocialForm(forms.ModelForm):
    """Step 5 — Social Links & Website."""
    class Meta:
        model  = AgentProfile
        fields = ['website_url', 'career_highlights']
        widgets = {
            'website_url':       forms.URLInput(attrs={'class': 'form-control'}),
            'career_highlights': forms.Textarea(attrs={'rows': 4, 'class': 'form-control'}),
        }
