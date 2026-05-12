"""
Django settings for PadosiAgent project.

Converted from Laravel 11 (config/app.php, config/database.php, config/auth.php, etc.)
"""

import os
from pathlib import Path
import environ

# =============================================================================
# BASE DIRECTORY
# =============================================================================
BASE_DIR = Path(__file__).resolve().parent.parent

# =============================================================================
# ENVIRONMENT VARIABLES (replaces Laravel's env() helper)
# =============================================================================
env = environ.Env(
    DJANGO_DEBUG=(bool, True),
    DB_PORT=(int, 3306),
)
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

# =============================================================================
# CORE SETTINGS
# =============================================================================
SECRET_KEY = env('DJANGO_SECRET_KEY')
DEBUG = env('DJANGO_DEBUG')
ALLOWED_HOSTS = env.list('DJANGO_ALLOWED_HOSTS', default=['localhost', '127.0.0.1'])

# =============================================================================
# APPLICATION DEFINITION
# Equivalent to Laravel's config/app.php 'providers' array
# =============================================================================
INSTALLED_APPS = [
    # Django built-in
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'rest_framework',
    'corsheaders',
    'django_filters',

    # Our apps (added module by module during conversion)
    'apps.accounts',
    'apps.agents',
    'apps.frontend',
    'apps.clients',
]

# =============================================================================
# MIDDLEWARE
# Equivalent to Laravel's app/Http/Kernel.php middleware stack
# =============================================================================
MIDDLEWARE = [
    # Django core middleware
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',

    # Custom middleware (converted from Laravel)
    'apps.accounts.middleware.SecurityHeadersMiddleware',
    'apps.accounts.middleware.ThreatMonitorMiddleware',
]

ROOT_URLCONF = 'config.urls'

# =============================================================================
# TEMPLATES
# Equivalent to Laravel's resources/views/ with Blade engine
# =============================================================================
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.join(BASE_DIR, 'templates'),
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# =============================================================================
# DATABASE
# Equivalent to Laravel's config/database.php
# Connects to the SAME MySQL database as the Laravel app
# =============================================================================
DATABASES = {
    'default': {
        'ENGINE': env('DB_ENGINE', default='django.db.backends.sqlite3'),
        'NAME': env('DB_NAME', default=os.path.join(BASE_DIR, 'db.sqlite3')),
        'USER': env('DB_USER', default='root'),
        'PASSWORD': env('DB_PASSWORD', default=''),
        'HOST': env('DB_HOST', default='127.0.0.1'),
        'PORT': env.int('DB_PORT', default=3306),
    }
}

# =============================================================================
# AUTHENTICATION
# Equivalent to Laravel's config/auth.php
# =============================================================================
AUTH_USER_MODEL = 'accounts.User'

AUTHENTICATION_BACKENDS = [
    'apps.accounts.backends.EmailBackend',      # Custom: login via email (like Laravel)
    'django.contrib.auth.backends.ModelBackend',  # Fallback: username login
]

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
     'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Password reset token expiry (equivalent to Laravel's auth.passwords.users.expire)
PASSWORD_RESET_TIMEOUT = 3600  # 60 minutes in seconds

# Login/logout redirect URLs
LOGIN_URL = '/agent-login/'
LOGIN_REDIRECT_URL = '/agent/dashboard/'
LOGOUT_REDIRECT_URL = '/'

# =============================================================================
# DJANGO REST FRAMEWORK
# =============================================================================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

# =============================================================================
# CORS (Cross-Origin Resource Sharing)
# =============================================================================
CORS_ALLOWED_ORIGINS = [
    'https://padosiagent.com',
    'https://padosiagents.com',
    'http://localhost:8000',
    'http://localhost:5173',   # Vite dev server
    'http://127.0.0.1:5173',
]
CORS_ALLOW_CREDENTIALS = True

# CSRF trusted origins (needed for React SPA making API calls)
CSRF_TRUSTED_ORIGINS = [
    'http://localhost:8000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://padosiagent.com',
    'https://padosiagents.com',
]

# =============================================================================
# INTERNATIONALIZATION
# Equivalent to Laravel's APP_LOCALE
# =============================================================================
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

# =============================================================================
# STATIC & MEDIA FILES
# Equivalent to Laravel's public/ directory
# =============================================================================
STATIC_URL = '/static/'

# Directory where the React production build lives
FRONTEND_DIR = os.path.join(BASE_DIR.parent, 'frontend', 'dist')

STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
    os.path.join(BASE_DIR.parent, 'public'),
]

# Include React's built directory if it exists
if os.path.isdir(FRONTEND_DIR):
    STATICFILES_DIRS.append(FRONTEND_DIR)

STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Application URL (used for building absolute URLs in models/views)
APP_URL = env('APP_URL', default='http://localhost:8000')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# =============================================================================
# SESSION
# Equivalent to Laravel's config/session.php
# =============================================================================
SESSION_ENGINE = 'django.contrib.sessions.backends.db'
SESSION_COOKIE_AGE = 7200  # 120 minutes (same as Laravel's SESSION_LIFETIME=120)
SESSION_COOKIE_SECURE = False  # Set True in production
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'

# CSRF cookie settings (needed for React SPA to read the CSRF token)
CSRF_COOKIE_HTTPONLY = False     # Allow JS to read the CSRF cookie
CSRF_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SECURE = False       # Set True in production

# =============================================================================
# EMAIL
# Equivalent to Laravel's config/mail.php
# =============================================================================
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = env('MAIL_HOST', default='smtp-relay.brevo.com')
EMAIL_PORT = env.int('MAIL_PORT', default=587)
EMAIL_HOST_USER = env('MAIL_USERNAME', default='')
EMAIL_HOST_PASSWORD = env('MAIL_PASSWORD', default='')
EMAIL_USE_TLS = True
DEFAULT_FROM_EMAIL = env('MAIL_FROM_ADDRESS', default='noreply@padosiagent.com')

# =============================================================================
# THIRD-PARTY SERVICE KEYS
# Equivalent to Laravel's config/services.php
# =============================================================================
RAZORPAY_KEY = env('RAZORPAY_KEY', default='')
RAZORPAY_SECRET = env('RAZORPAY_SECRET', default='')
RAZORPAY_WEBHOOK_SECRET = env('RAZORPAY_WEBHOOK_SECRET', default='')

GOOGLE_CLIENT_ID = env('GOOGLE_CLIENT_ID', default='')
GOOGLE_CLIENT_SECRET = env('GOOGLE_CLIENT_SECRET', default='')
GOOGLE_REDIRECT_URI = env('GOOGLE_REDIRECT_URI', default='')

BREVO_API_KEY = env('BREVO_API_KEY', default='')

# Admin IP whitelist (equivalent to Laravel's AdminIpWhitelist middleware)
ADMIN_WHITELIST_IPS = env.list('ADMIN_WHITELIST_IPS', default=[])

# Cloudinary configuration (Reads CLOUDINARY_URL from .env automatically if present, or configure manually)
import cloudinary
if env('CLOUDINARY_URL', default=''):
    pass # cloudinary will auto-configure from env var
else:
    cloudinary.config(
        cloud_name = env('CLOUDINARY_CLOUD_NAME', default=''),
        api_key = env('CLOUDINARY_API_KEY', default=''),
        api_secret = env('CLOUDINARY_API_SECRET', default=''),
        secure = True
    )

# =============================================================================
# LOGGING
# Equivalent to Laravel's config/logging.php
# =============================================================================
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'logs', 'django.log'),
            'formatter': 'verbose',
        },
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'apps': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
