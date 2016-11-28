from __future__ import unicode_literals
import logging
from push_notifications.models import APNSDevice, GCMDevice
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
import pusher_module

from django.conf import settings
from django.http import HttpResponse
from website.models import UserProfile

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


# @permission_classes((AllowAny, ))
@api_view(['POST'])
def mobile_webhook(request):
    logger.debug('Mobile webhook: {}'.format(request.data))

    if 'unregister' in request.data:
        return _unregister(request)
    elif 'token_invalid' in request.data:
        return _invalidate(request)
    else:
        return _register(request)


@permission_classes((AllowAny, ))
@api_view(['GET', 'POST'])
def ionic_push(request):
    print('Ionic push. method: {}, body: {}'.format(
        request.method, request.body))


def _register(request):
    logger.info('Mobile register: {}, user: {}'.format(
        request.data, request.user.id))
    user_id = request.user.id
    if not user_id:
        logger.error('Mobile webhook missing a user id: {}'.format(
            request.data))
        return Response('Mobile webhook missing a user id', status=400)

    try:
        user = UserProfile.objects.get(id=user_id)
    except UserProfile.DoesNotExist:
        logger.exception('Mobile webhook sent an invalid user id: {}'.format(
            request.data))
        return Response('Mobile webhook sent an invalid user id', status=404)

    logger.debug('device id {}'.format(request.data.get('device_id')))
    try:
        # Update or create a device for this user
        if request.data.get('platform', 'android'):
            device, created = GCMDevice.objects.get_or_create(
                user=user, device_id=request.data.get('device_id'),
                defaults={'registration_id': request.data['register']})
        else:
            device, created = APNSDevice.objects.get_or_create(
                user=user, device_id=request.data.get('device_id'),
                defaults={'registration_id': request.data['register']})
        if created or device.registration_id != request.data['register']:
            logger.info('Saving new mobile push for user {}'.format(user))
            device.registration_id = request.data['register']
            device.save()
        else:
            logger.debug('Not updating mobile push for user {}'.format(user))
    except Exception as e:
        logger.exception('Failed to create a push session: {}'.format(e))
    return Response(status=200)


def _unregister(request):
    logger.info('Mobile unregister: {}'.format(request.data))


def _invalidate(request):
    logger.info('Mobile invalidate: {}'.format(request.data))
