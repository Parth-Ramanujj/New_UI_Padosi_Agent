from django.contrib import admin
from .models import Client

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_fullname', 'get_email', 'mobile', 'pincode', 'created_at')
    search_fields = ('user__fullname', 'user__email', 'mobile')
    ordering = ('-created_at',)
    
    def get_fullname(self, obj):
        return obj.user.fullname
    get_fullname.short_description = 'Full Name'
    get_fullname.admin_order_field = 'user__fullname'

    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'
    get_email.admin_order_field = 'user__email'
