from __future__ import unicode_literals
import json
import logging

from django.conf import settings
from django.core.serializers.json import DjangoJSONEncoder
from django.http import HttpResponse
from rest_framework.renderers import JSONRenderer
import pusher



logger = logging.getLogger()


def push_auth(request):
    channel_name = request.POST.get('channel_name')
    socket_id = request.POST.get('socket_id')

    channel_data = {
        'user_id': request.user.id,
        'user_info': request.user.serialize().data
    }
    logger.info("{} {} {} {} {} {} ".format(
        channel_name,
        socket_id,
        channel_data,
        settings.PUSHER_APP_ID,
        settings.PUSHER_KEY,
        settings.PUSHER_SECRET))

    p = pusher.Pusher(app_id=settings.PUSHER_APP_ID,
                      key=settings.PUSHER_KEY,
                      secret=settings.PUSHER_SECRET)
    p.encoder = DjangoJSONEncoder

    auth = p[channel_name].authenticate(socket_id, channel_data)
    json_data = json.dumps(auth)

    return HttpResponse(json_data)


def send_all(message_type, message, user=None):
    if not settings.PUSHER_ENABLE:
        return
    data = JSONRenderer().render(message)
    p = pusher.Pusher(app_id=settings.PUSHER_APP_ID,
                      key=settings.PUSHER_KEY,
                      secret=settings.PUSHER_SECRET)
    logger.info("Sending {}:{}".format(message_type, data))
    try:
        p[settings.PUSHER_CHANNEL].trigger(message_type, data)
    except Exception:
        logger.warning('Unable to send requests to push')
