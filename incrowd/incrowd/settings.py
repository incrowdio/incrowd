"""
Django settings for incrowd project.

For more information on this file, see
https://docs.djangoproject.com/en/1.6/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.6/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import json

import os

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

# Site settings
EMAIL_SENDER = 'incrowd@incrowd.io'
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
DOMAIN = 'incrowd.io'
SITE_NAME = 'inCrowd'

# Determine which environment we're running in.
if os.environ.get('SETTINGS_MODE') == 'prod':
    ENV = 'prod'
elif os.environ.get('SETTINGS_MODE') == 'CODESHIP':
    ENV = 'codeship'
elif os.environ.get('TRAVIS'):
    ENV = 'travis'
else:
    ENV = 'local'

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.6/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '4wd(bfk2m5qj2k0p7(w6)(q$+o040_+_9y$z^_h%ua^(=v2lb2'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True
DEBUG_TOOLBAR = False
DEBUG_TOOLBAR_PATCH_SETTINGS = False

TEMPLATE_DEBUG = True

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.contrib.auth.context_processors.auth',
    'django.core.context_processors.debug',
    'django.core.context_processors.i18n',
    'django.core.context_processors.media',
    'django.core.context_processors.static',
    'django.core.context_processors.tz',
    'django.contrib.messages.context_processors.messages',
    'django.core.context_processors.request',
)

TEMPLATE_DIRS = (
    os.path.join(BASE_DIR, 'frontend/www'),
)

ALLOWED_HOSTS = []

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'djangle',
    'djoser',
    'push_notifications',
    'invite_only',
    'chat_server',
    'poll',
    'push',
    'notify',
    'website',
]

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
)
CORS_ORIGIN_ALLOW_ALL = True

# if ENV in ['localprod', 'local', 'codeship', 'travis']:
# INSTALLED_APPS += ['django_nose']

# DEBUG_TOLBAR_PATCH_SETTINGS = False
# MIDDLEWARE_CLASSES += ('debug_toolbar.middleware.'
# 'DebugToolbarMiddleware',)

ROOT_URLCONF = 'incrowd.urls'

WSGI_APPLICATION = 'incrowd.wsgi.application'

AUTHENTICATION_BACKENDS = (
    # Needed to login by username in Django admin, regardless of `allauth`
    'django.contrib.auth.backends.ModelBackend',

    # `allauth` specific authentication methods, such as login by e-mail
    # 'allauth.account.auth_backends.AuthenticationBackend',
)

PUSH_NOTIFICATIONS_SETTINGS = {
    'GCM_API_KEY': '<your api key>',
    'APNS_CERTIFICATE': '/path/to/your/certificate.pem',
}

# Database
# https://docs.djangoproject.com/en/1.6/ref/settings/#databases

if ENV == 'shippable':
    INSTALLED_APPS += ['django_nose']
    # Running in development, so use a local MySQL database.
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': 'incrowd',
            'USER': 'shippable',
            'HOST': '172.17.42.1',  # Access MySQL on a Docker host
        }
    }

else:
    # Running in development, so use sqlite for simplicity
    DATABASES = {
        'default': {
            'ENGINE': (os.environ.get('DB_BACKEND') or
                       'django.db.backends.sqlite3'),
            'NAME': os.environ.get('DB_NAME') or os.path.join(
                BASE_DIR, 'config/db.sqlite3'),
            'USER': os.environ.get('DB_USER') or 'incrowd',
            'PASSWORD': os.environ.get('DB_PASSWORD') or 'incrowd',
            'HOST': os.environ.get('DB_ADDR') or '192.168.59.103',
        }
    }

print DATABASES

# Internationalization
# https://docs.djangoproject.com/en/1.6/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.6/howto/static-files/
STATIC_URL = '/static/'

# Allow serving the frontend during dev, otherwise this is a webserver's job
if ENV == 'local':
    STATICFILES_DIRS = (
        'frontend',
    )

STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
MEDIA_ROOT = 'media'

# AllAuth
AUTH_USER_MODEL = 'website.UserProfile'

ACCOUNT_SIGNUP_PASSWORD_VERIFICATION = False
LOGOUT_REDIRECT_URL = '/'
LOGIN_REDIRECT_URL = '/'
ACCOUNT_ADAPTER = 'invite_only.adapter.InviteOnlyAccountAdapter'
ACCOUNT_AUTHENTICATION_METHOD = 'username'
ACCOUNT_LOGOUT_REDIRECT_URL = '/'

SITE_ID = 1

TEST_RUNNER = 'django_nose.NoseTestSuiteRunner'

NOSE_ARGS = [
    '--with-xunit',
    '--xunit-file=nosetests.xml'
]

# API
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.BasicAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_FILTER_BACKENDS': ('rest_framework.filters.DjangoFilterBackend',)
}

PUSH_DISABLED = False
# Only supported push module is pusher
PUSH_MODULE = 'pusher'

DJOSER = {
    'DOMAIN': DOMAIN,
    'SITE_NAME': SITE_NAME,
    'PASSWORD_RESET_CONFIRM_URL': '#/password/reset/confirm/{uid}/{token}',
    'ACTIVATION_URL': '#/activate/{uid}/{token}',
    'LOGIN_AFTER_ACTIVATION': True,
    'SEND_ACTIVATION_EMAIL': True,
}

# Pusher
PUSHER_ENABLE = False
PUSHER_APP_ID = ''
PUSHER_KEY = ''
PUSHER_SECRET = ''
PUSHER_CHANNEL = ''
PUSHER_PRESENCE = ''

# Mime Types
MIME_IMAGES = [
    'image/gif',
    'image/gifv',
    'image/jpeg',
    'image/pjpeg',
    'image/png',
    'image/svg+xml',
    'image/example',
]

MIME_GIFV = [
    # NOTE(pcsforeducation) imgur gifv :/
    'text/html'
]

MIME_AUDIO = [
    'audio/mpeg',
    'audio/mp4',
    'audio/ogg',
    'audio/vorbis',
    'audio/webm'
]

MIME_VIDEO = [
    'video/mpeg',
    'video/mp4',
    'video/webm',
    'video/x-matroska',
    'video/x-ms-wmv',
    'video/x-flv',
    'video/avi'
]

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'formatters': {
        'verbose': {
            'format': '%(levelname)s %(asctime)s %(name)s %(process)d %('
                      'thread)d %(message)s',
        },
        'simple': {
            'format': '%(name)s %(levelname)s %(message)s',
        },
    },
    'handlers': {
        'mail_admins': {
            'level': 'DEBUG',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler'
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
        'logfile': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': 'debug.log',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        '': {
            'handlers': ['console', 'logfile'],
            'propagate': True,
            'level': 'INFO',
        },
        'django.request': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': True,
        },
    }
}

try:
    from config.production_settings import *  # NOQA
except Exception:
    pass


# Load environment overrides
try:
    env = os.environ.get('DJANGO_ENV', '{}')
    for key, value in json.loads(env).items():
        print('Overring setting: {} to {}'.format(key, value))
        vars()[key] = value
except ValueError:
    pass
