"""
PadosiAgent — Accounts Models
Converted from Laravel Eloquent models:
  - app/Models/User.php      → User (custom AbstractUser)
  - app/Models/Admin.php     → Admin
  - app/Models/UserType.php  → UserType

All models use managed=False to map to EXISTING MySQL tables
without Django touching the schema.
"""

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


# =============================================================================
# CUSTOM USER MANAGER
# Required because we use 'email' as the login field instead of 'username'
# =============================================================================
class UserManager(BaseUserManager):
    """Custom manager for User model where email is the primary identifier."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        return self.create_user(email, password, **extra_fields)


# =============================================================================
# USER MODEL
# Converted from: app/Models/User.php
# Table: users (created by Laravel migration 2026_01_29_074810)
#
# Laravel schema:
#   id, fullname, email, password, remember_token,
#   role (enum: admin/agent/client), status (enum: active/inactive/suspended),
#   email_verified_at, last_login_at, created_at, updated_at
#
# Laravel relationships:
#   hasOne(Agent), hasOne(Client), hasMany(FavoriteAgent)
#
# Laravel methods:
#   hasRole(), isAdmin(), isAgent(), isClient(), getDashboardUrl()
# =============================================================================
class User(AbstractUser):
    """
    Custom User model mapped to the existing Laravel 'users' table.

    Key differences from Django's default User:
    - Uses 'email' as the login field (not 'username')
    - Has a 'role' field for RBAC (agent/client/admin)
    - Has 'fullname' instead of first_name/last_name
    - 'status' field for account state management
    """

    class Role(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        AGENT = 'agent', 'Agent'
        CLIENT = 'client', 'Client'

    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        INACTIVE = 'inactive', 'Inactive'
        SUSPENDED = 'suspended', 'Suspended'

    # Override Django's default fields to match Laravel schema
    # Note: AbstractUser already has: username, first_name, last_name, email,
    # is_staff, is_active, is_superuser, last_login, date_joined, password
    fullname = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CLIENT,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
    )
    email_verified_at = models.DateTimeField(blank=True, null=True)
    last_login_at = models.DateTimeField(blank=True, null=True)
    remember_token = models.CharField(max_length=100, blank=True, null=True)

    # Timestamps (Laravel's created_at / updated_at)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Use email as the login identifier
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['fullname']

    objects = UserManager()

    class Meta:
        managed = False  # Don't let Django alter the existing 'users' table
        db_table = 'users'

    def __str__(self):
        return f"{self.fullname} ({self.email})"

    # -------------------------------------------------------------------------
    # Role helper methods (converted from Laravel)
    # -------------------------------------------------------------------------
    def has_role(self, role: str) -> bool:
        """Check if user has a specific role. (Laravel: hasRole())"""
        return self.role == role

    def is_admin(self) -> bool:
        """Laravel: isAdmin()"""
        return self.role == self.Role.ADMIN

    def is_agent(self) -> bool:
        """Laravel: isAgent()"""
        return self.role == self.Role.AGENT

    def is_client(self) -> bool:
        """Laravel: isClient()"""
        return self.role == self.Role.CLIENT

    def get_dashboard_url(self) -> str:
        """
        Get the dashboard URL for this user's role.
        Converted from Laravel: getDashboardUrl()
        """
        dashboard_map = {
            self.Role.ADMIN: '/admin/dashboard/',
            self.Role.AGENT: '/agent/dashboard/',
            self.Role.CLIENT: '/find-agents/',
        }
        return dashboard_map.get(self.role, '/')


# =============================================================================
# ADMIN MODEL
# Converted from: app/Models/Admin.php
# Table: admins (created by Laravel migration 2026_03_21_070000)
#
# Laravel schema:
#   id, name, email, password, remember_token, created_at, updated_at
#
# Note: Laravel uses a SEPARATE 'admin' auth guard with its own session.
# In Django, we handle this via the User model's 'role' field + middleware.
# This Admin model is kept for backward compatibility with the existing table.
# =============================================================================
class Admin(models.Model):
    """
    Admin model mapped to the existing Laravel 'admins' table.

    In Laravel, admins have their own auth guard and login separately.
    In Django, we primarily use the User model with role='admin',
    but this model remains for backward compatibility with the existing
    admin table data.
    """
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    remember_token = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False  # Don't alter existing 'admins' table
        db_table = 'admins'

    def __str__(self):
        return f"{self.name} ({self.email})"


# =============================================================================
# USER TYPE MODEL
# Converted from: app/Models/UserType.php
# Table: user_types
#
# Laravel schema:
#   id, slug, name, created_at, updated_at
#
# Laravel relationships:
#   belongsToMany(Agent, 'agent_user_type')
# =============================================================================
class UserType(models.Model):
    """
    UserType model — categories of users/agents.
    Maps to the existing 'user_types' table.

    In Laravel this is used via a many-to-many pivot table 'agent_user_type'
    with the Agent model. That relationship will be defined in the agents app.
    """
    slug = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'user_types'

    def __str__(self):
        return self.name

# =============================================================================
# ADMIN ACTIVITY LOG MODEL
# Converted from: app/Models/AdminActivityLog.php
# =============================================================================
class AdminActivityLog(models.Model):
    admin = models.ForeignKey(Admin, on_delete=models.CASCADE, db_column='admin_id')
    action = models.CharField(max_length=255)
    model_type = models.CharField(max_length=255, null=True, blank=True)
    model_id = models.BigIntegerField(null=True, blank=True)
    details = models.JSONField(null=True, blank=True)
    ip_address = models.CharField(max_length=45, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'admin_activity_logs'

# =============================================================================
# BLOCKED IP MODEL
# Converted from: app/Models/BlockedIp.php
# =============================================================================
class BlockedIp(models.Model):
    ip_address = models.CharField(max_length=45, unique=True)
    reason = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'blocked_ips'

# =============================================================================
# SECURITY THREAT LOG MODEL
# Converted from: app/Models/SecurityThreatLog.php
# =============================================================================
class SecurityThreatLog(models.Model):
    ip_address = models.CharField(max_length=45, null=True, blank=True)
    event_type = models.CharField(max_length=255, null=True, blank=True)
    hacker_name = models.CharField(max_length=255, null=True, blank=True)
    hacker_email = models.CharField(max_length=255, null=True, blank=True)
    hacker_mobile = models.CharField(max_length=255, null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    isp = models.CharField(max_length=255, null=True, blank=True)
    url = models.TextField(null=True, blank=True)
    payload = models.TextField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'security_threat_logs'
