from __future__ import unicode_literals
import logging

from incrowd.website.models import UserProfile
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from notify.models import Notification, NotificationSerializer
from push.models import PushSession

logger = logging.getLogger(__name__)


class NotificationViewSet(viewsets.ModelViewSet):
    """
    List all notifications or create new ones
    """
    model = Notification
    paginate_by = 10
    paginate_by_param = 'num_notifications'
    max_paginate_by = 20
    serializer = NotificationSerializer

    def get_queryset(self):
        """
        This view should return a list of all the purchases
        for the currently authenticated user.
        """
        user = self.request.user
        return Notification.objects.filter(user=user)


@api_view(['POST'])
def ionic_webhook(request):
    logger.debug('Ionic webhook: {}'.format(request.data))

    if 'unregister' in request.data:
        _unregister(request)
    elif 'token_invalid' in request.data:
        _invalidate(request)
    else:
        _register(request)


def _register(request):
    logger.info('Ionic register: {}'.format(request.data))
    user_id = request.data.get('user_id')
    if not user_id:
        logger.error('Ionic webhook missing a user id: {}'.format(
            request.data))
        return Response(status=400)

    try:
        user = UserProfile.object.get(id=user_id)
    except UserProfile.DoesNotExist:
        logger.exception('Ionic webhook sent an invalid user id: {}'.format(
            request.data))
        return Response(status=404)

    push = request.data.get('_push', {})
    tokens = ','.join(push.get('android_tokens', []) +
                      push.get('ios_tokens', []))
    if tokens == '':
        logger.error('Ionic webhook missing tokens: {}'.format(request.data))
        return Response(status=400)

    logger.info(
        'Saving new push session for user {} with tokens {}'.format(user,
                                                                    tokens))
    PushSession(user=user_id, session_key=tokens, push_type='ionic').save()
    return Response(status=200)


def _unregister(request):
    logger.info('Ionic unregister: {}'.format(request.data))


def _invalidate(request):
    logger.info('Ionic invalidate: {}'.format(request.data))
