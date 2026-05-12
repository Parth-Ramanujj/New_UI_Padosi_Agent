"""
PadosiAgent — Custom Authentication Backend
Converted from Laravel's auth configuration (config/auth.php)

In Laravel, authentication is done via Auth::attempt() which checks
the 'users' table by email + password using the Eloquent provider.

In Django, we achieve the same with a custom authentication backend
that authenticates via email instead of username.
"""

from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

User = get_user_model()


class EmailBackend(ModelBackend):
    """
    Custom auth backend: authenticate users by email + password.

    This replaces Laravel's default Eloquent auth provider:
        Auth::attempt(['email' => $email, 'password' => $password])

    Django equivalent:
        authenticate(request, email=email, password=password)
    """

    def authenticate(self, request, email=None, password=None, **kwargs):
        # Also support 'username' kwarg for compatibility
        if email is None:
            email = kwargs.get('username')

        if email is None or password is None:
            return None

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Run the password hasher to prevent timing attacks
            # (same security practice as Laravel)
            User().set_password(password)
            return None

        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None

    def user_can_authenticate(self, user):
        """
        Reject users whose status is not 'active'.
        This mirrors Laravel's behavior where inactive/suspended users
        cannot log in.
        """
        # Check Django's is_active flag
        is_active = getattr(user, 'is_active', True)
        # Also check our custom status field
        status_active = getattr(user, 'status', 'active') == 'active'
        return is_active and status_active
