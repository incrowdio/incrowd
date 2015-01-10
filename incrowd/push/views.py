import json
import logging

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.core.serializers.json import DjangoJSONEncoder
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from pusher import Config, Pusher

from website.models import UserSerializer

logger = logging.getLogger()


@csrf_exempt
@login_required
def connect(request):
    logger.info("{} connected".format(request.user.username))


@csrf_exempt
@login_required
def disconnect(request):
    logger.info("{} disconnected".format(request.user.username))


@api_view(['POST'])
def check_in(request):
    # Save user to update connected users
    request.user.save()
    logger.info('{} checked in'.format(request.user))
    return HttpResponse(status=201)


@api_view(['POST'])
def pusher_auth(request):
    channel_name = request.POST.get('channel_name')
    socket_id = request.POST.get('socket_id')

    # Convert datetime to string
    user_info = UserSerializer(request.user).data
    user_info['last_updated'] = str(user_info['last_updated'])

    channel_data = {
        'user_id': request.user.id,
        'user_info': user_info
    }

    conf = Config(
        app_id=settings.PUSHER_APP_ID,
        key=settings.PUSHER_KEY,
        secret=settings.PUSHER_SECRET)

    auth = conf.authenticate_subscription(
        channel=channel_name,
        socket_id=socket_id,
        custom_data=channel_data
    )


    # # p.encoder = DjangoJSONEncoder
    # auth = p.trigger([settings.PUSHER_CHANNEL], unicode(message_type), data)
    # auth = p[channel_name].authenticate(socket_id, channel_data)
    json_data = json.dumps(auth)

    return HttpResponse(json_data)
