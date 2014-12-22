from django.conf import settings
from poll.models import Poll


def settings_context(request):
    return {'SITE_NAME': settings.SITE_NAME}


def polls(request):
    return {'POLLS': Poll.objects.all()}
