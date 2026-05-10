from django.urls import path
from . import views

app_name = 'clients'

urlpatterns = [
    path('quick-register/', views.quick_register, name='quick_register'),
]
