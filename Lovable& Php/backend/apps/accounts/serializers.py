"""
PadosiAgent — Accounts DRF Serializers
Provides REST API serialization for User and Admin models.

This has no direct Laravel equivalent — Laravel didn't have a REST API.
These are NEW additions for the Django REST Framework layer.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for the User model — used for profile/listing endpoints."""

    class Meta:
        model = User
        fields = [
            'id', 'fullname', 'email', 'role', 'status',
            'email_verified_at', 'last_login_at', 'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'last_login_at']


class UserMinimalSerializer(serializers.ModelSerializer):
    """Minimal user info — used in nested relationships."""

    class Meta:
        model = User
        fields = ['id', 'fullname', 'email', 'role']
        read_only_fields = fields


class LoginSerializer(serializers.Serializer):
    """Serializer for API login endpoint."""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    login_type = serializers.ChoiceField(
        choices=['agent', 'client'],
        required=False,
        default='agent',
    )


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for requesting a password reset link."""
    email = serializers.EmailField()
    login_type = serializers.ChoiceField(choices=['agent', 'client'])


class PasswordResetSerializer(serializers.Serializer):
    """Serializer for performing the password reset."""
    token = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirmation = serializers.CharField(write_only=True, min_length=8)
    login_type = serializers.ChoiceField(choices=['agent', 'client'])

    def validate(self, data):
        if data['password'] != data['password_confirmation']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return data
