import datetime
import json
import logging
import random

from django.core.serializers.json import DjangoJSONEncoder
from django.db import models
from django.conf import settings
# from google.appengine.api import channel
from rest_framework.renderers import JSONRenderer
from rest_framework import serializers
import pusher


logger = logging.getLogger(__name__)


def random_key(length=64):
    return ''.join(random.choice('0123456789ABCDEF') for i in range(length))


class PushSession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL)
    started = models.DateTimeField(auto_now_add=True)
    last_update = models.DateTimeField(auto_now=True, db_index=True)
    session_key = models.CharField(max_length=255, default=None,
                                   db_index=True, unique=True)
    ended = models.DateTimeField(blank=True, null=True, default=None)

    def save(self, *args, **kwargs):
        super(PushSession, self).save(*args, **kwargs)

    def __unicode__(self):
        return "{0}: {1}, connected: {2}".format(self.user,
                                                 self.session_key,
                                                 self.started)

    def __repr__(self):
        return "<{0}, {1}>".format(PushSession, self.__unicode__())


class PushSessionSerializer(serializers.ModelSerializer):
    started = serializers.CharField(max_length=255, read_only=True)
    last_update = serializers.CharField(max_length=255, read_only=True)
    ended = serializers.CharField(max_length=255, read_only=True)
    session_key = serializers.CharField(max_length=255, read_only=True)
    user = serializers.PrimaryKeyRelatedField(source='user', read_only=True)

    class Meta:
        model = PushSession
        fields = ('started', 'last_update', 'ended', 'session_key',
                  'user')
        depth = 1


def get_all_connected(user=None):
    timeout = getattr(settings, 'PUSH_SESSION_TIMEOUT', 300)
    timeout_dt = datetime.datetime.now() - datetime.timedelta(seconds=timeout)
    sessions = PushSession.objects.filter(ended__isnull=True).filter(
        last_update__gt=timeout_dt)
    if user:
        sessions = sessions.filter(user=user)
    logger.debug("Conencted users: {}".format(sessions))
    return sessions


def send_all(message_type, message, user=None):
    data = JSONRenderer().render(message)
    try:
        p = pusher.Pusher(app_id=settings.PUSHER_APP_ID,
                          key=settings.PUSHER_KEY,
                          secret=settings.PUSHER_SECRET)
        # p.channel_type = pusher.GoogleAppEngineChannel
        logger.info("Sending {}:{}".format(message_type, data))
        p[settings.PUSHER_CHANNEL].trigger(message_type, data)
    except Exception:
        logger.warning('Unable to send requests to push')
