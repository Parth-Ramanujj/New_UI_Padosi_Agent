from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Admin, UserType

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('id', 'fullname', 'email', 'role', 'status', 'is_active')
    list_filter = ('role', 'status')
    search_fields = ('fullname', 'email')
    ordering = ('-created_at',)
    filter_horizontal = ()
    
    # Redefine fieldsets since we removed first_name/last_name and use fullname
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('fullname',)}),
        ('Permissions', {'fields': ('role', 'status')}),
        ('Important dates', {'fields': ('last_login',)}),
    )

@admin.register(Admin)
class LegacyAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'email', 'created_at')
    search_fields = ('name', 'email')

@admin.register(UserType)
class UserTypeAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'slug')
    search_fields = ('name', 'slug')
