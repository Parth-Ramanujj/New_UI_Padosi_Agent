from django.urls import path
from django.views.generic import TemplateView
from . import views, search_views, pwa_views

app_name = 'frontend'

urlpatterns = [
    # Core Public Pages
    path('', views.index, name='index'),
    path('about/', views.about, name='about'),
    path('faq/', views.faq, name='faq'),
    path('contact/', views.contact, name='contact'),
    path('submit-contact/', views.submit_contact, name='submit_contact'),
    
    # Search & Filtering
    path('find-agents/', search_views.find_agents, name='find_agents'),
    
    # PWA Routes
    path('manifest.webmanifest', pwa_views.manifest, name='manifest'),
    path('sw.js', pwa_views.sw_js, name='sw_js'),
    path('offline.html', pwa_views.offline, name='offline'),

    # Participant Routes
    path('participant/store/', pwa_views.store_participant, name='store_participant'),

    # Static Pages
    path('calculator/', TemplateView.as_view(template_name='calculator.html'), name='calculator'),
    path('privacy/', TemplateView.as_view(template_name='privacy.html'), name='privacy'),
    path('terms/', TemplateView.as_view(template_name='terms.html'), name='terms'),
]
