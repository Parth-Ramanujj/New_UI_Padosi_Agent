from django.db import models
from apps.accounts.models import User

class Client(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='client_profile')
    mobile = models.CharField(max_length=20, null=True, blank=True)
    pincode = models.CharField(max_length=10, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'clients'

    def __str__(self):
        return f"Client: {self.user.fullname}"
