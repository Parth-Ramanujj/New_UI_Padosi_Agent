from django.contrib import admin
from .models import SiteSetting, ContactSubmission, Participant, Pincode

@admin.register(SiteSetting)
class SiteSettingAdmin(admin.ModelAdmin):
    list_display = ('key', 'value', 'updated_at')
    search_fields = ('key', 'value')

@admin.register(ContactSubmission)
class ContactSubmissionAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'email', 'subject', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('name', 'email', 'subject')
    ordering = ('-created_at',)
    
    actions = ['mark_resolved', 'mark_pending']
    
    def mark_resolved(self, request, queryset):
        queryset.update(status='resolved')
    mark_resolved.short_description = "Mark selected as resolved"
    
    def mark_pending(self, request, queryset):
        queryset.update(status='pending')
    mark_pending.short_description = "Mark selected as pending"

@admin.register(Participant)
class ParticipantAdmin(admin.ModelAdmin):
    list_display = ('id', 'full_name', 'email', 'phone_number', 'shareable_id', 'participant_shared', 'created_at')
    list_filter = ('participant_shared',)
    search_fields = ('full_name', 'email', 'phone_number', 'shareable_id')
    ordering = ('-created_at',)

@admin.register(Pincode)
class PincodeAdmin(admin.ModelAdmin):
    list_display = ('pincode', 'office_name', 'district', 'state', 'latitude', 'longitude')
    search_fields = ('pincode', 'office_name', 'district', 'state')
