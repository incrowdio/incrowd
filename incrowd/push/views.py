import json
import logging

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.core.serializers.json import DjangoJSONEncoder
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
import pusher

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

    channel_data = {
        'user_id': request.user.id,
        'user_info': UserSerializer(request.user).data
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