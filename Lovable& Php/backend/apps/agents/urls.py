from django.urls import path
from . import views
from . import views_registration

app_name = 'agents'

urlpatterns = [
    # Dashboard
    path('dashboard/', views.dashboard, name='dashboard'),
    path('referral/', views.referral, name='referral'),
    
    # Profile View (Public)
    path('profile/<str:slug>/', views.show_profile, name='show_profile'),
    
    # Edit Profile (Protected)
    path('profile/edit/data/', views.edit_profile, name='edit_profile'),
    path('profile/update/', views.update_profile, name='update_profile'),
    
    # Store Review
    path('profile/<str:slug>/review/', views.store_review, name='store_review'),
    
    # Lead Capture
    path('leads/capture/', views.capture_lead, name='capture_lead'),
    
    # Lead Management
    path('leads/', views.lead_list, name='lead_list'),
    path('leads/<int:lead_id>/', views.lead_detail, name='lead_detail'),
    path('leads/<int:lead_id>/update-status/', views.lead_update_status, name='lead_update_status'),
    
    # Push Tokens
    path('push-token/', views.store_push_token, name='store_push_token'),
    
    # OG Image
    path('og-image/<int:agent_id>.jpg', views.og_image, name='og_image'),
    
    # Registration Flow
    path('register/', views_registration.register_page, name='register_page'),
    path('register/step1/', views_registration.register_step1, name='register_step1'),
    path('register/verify-otp/', views_registration.verify_otp, name='verify_otp'),
    path('register/resend-otp/', views_registration.resend_otp, name='resend_otp'),
    path('register/step2/', views_registration.register_step2, name='register_step2'),
    path('register/complete/', views_registration.complete_registration, name='complete_registration'),
    
    # Payment / Webhooks
    path('payment/success/', views_registration.handle_payment_success, name='payment_success'),
    path('payment/failure/', views_registration.handle_payment_failure, name='payment_failure'),
    path('webhook/razorpay/', views_registration.razorpay_webhook, name='razorpay_webhook'),
    
    # Utils
    path('check-email/', views_registration.check_email, name='check_email'),
]
