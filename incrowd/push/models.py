from __future__ import unicode_literals
import logging
import random

from django.db import models
from django.conf import settings

logger = logging.getLogger(__name__)

PUSH_CHOICES = (('website', 'pusher'),
                ('ionic', 'ionic'))

PUSH_DEVICE_TYPES = (('ios', 'ios'), ('android', 'android'))

def random_key(length=64):
    return ''.join(random.choice('0123456789ABCDEF') for _ in range(length))


class PushSession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL)
    started = models.DateTimeField(auto_now_add=True)
    last_update = models.DateTimeField(auto_now=True, db_index=True)
    session_key = models.CharField(max_length=255, default=None,
                                   db_index=True, unique=True)
    ended = models.DateTimeField(blank=True, null=True, default=None)
    # Whether to send via Ionic, GCM/APN directly, or to the website
    push_type = models.CharField(max_length=64, choices=PUSH_CHOICES,
                                 default='pusher')

    def save(self, *args, **kwargs):
        super(PushSession, self).save(*args, **kwargs)

    def __unicode__(self):
        return "{0}: {1}, connected: {2}".format(self.user,
                                                 self.session_key,
                                                 self.started)

    def __repr__(self):
        return "<{0}, {1}>".format(PushSession, self.__unicode__())


class PushDeviceToken(models.Model):
    screen_height = models.IntegerField()
    screen_width = models.IntegerField()
    token = models.CharField(max_length=255)
    unregister = models.BooleanField(default=False)
    received = models.DateTimeField()
    app_id = models.CharField(max_length=64)
    user_id = models.CharField(max_length=64)
    device_type = models.CharField(max_length=16, choices=PUSH_DEVICE_TYPES)
