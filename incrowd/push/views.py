from __future__ import unicode_literals
import logging

from django.conf import settings
from django.http import HttpResponse
from rest_framework.decorators import api_view

import pusher_module


logger = logging.getLogger()


@api_view(['POST'])
def check_in(request):
    # Save user to update connected users
    request.user.save()
    logger.info('{} checked in'.format(request.user))
    return HttpResponse(status=201)


@api_view(['POST'])
def push_auth(request):
    if settings.PUSH_MODULE == 'pusher':
        return pusher_module.push_auth(request)


def send_all(message_type, message, user=None):
    if settings.PUSH_MODULE == 'pusher':
        return pusher_module.send_all(message_type, message, user)
