"""
PadosiAgent — Accounts URL Configuration
Converted from Laravel's routes/web.php (auth-related routes only)

Laravel routes → Django URL patterns:
    POST /login              → accounts:login
    POST /logout             → accounts:logout
    GET  /agent-login        → accounts:agent_login
    GET  /client-login       → accounts:client_login
    GET  /forgot-password    → accounts:forgot_password
    POST /forgot-password    → accounts:send_reset_link
    GET  /reset-password/<t> → accounts:reset_password_page
    POST /reset-password     → accounts:reset_password
"""

from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    # Login pages (GET) — equivalent to Route::view('/agent-login', ...)
    path('agent-login/', views.agent_login, name='agent_login'),
    path('client-login/', views.client_login, name='client_login'),

    # Login handler (POST) — equivalent to Route::post('/login', ...)
    path('login/', views.login_view, name='login'),

    # Logout (POST) — equivalent to Route::post('/logout', ...)
    path('logout/', views.logout_view, name='logout'),

    # Forgot password — equivalent to Route::get/post('/forgot-password', ...)
    path('forgot-password/', views.forgot_password_page, name='forgot_password'),
    path('forgot-password/send/', views.send_reset_link, name='send_reset_link'),

    # Reset password — equivalent to Route::get/post('/reset-password', ...)
    path('reset-password/<str:token>/', views.reset_password_page, name='reset_password_page'),
    path('reset-password/', views.reset_password, name='reset_password'),
]
