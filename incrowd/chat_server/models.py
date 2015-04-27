from __future__ import unicode_literals
import logging
import random

from django.db import models
from django.conf import settings
from rest_framework import serializers

from notify import utils as notify_utils
from notify.models import send_all
from website.models import UserProfile
from website import utils as web_utils


logger = logging.getLogger(__name__)


def random_key(length=64):
    return ''.join(random.choice('0123456789ABCDEF') for i in range(length))


class ChatMessage(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL)
    message = models.TextField()
    sent = models.DateTimeField(auto_now_add=True, db_index=True)
    attachment_url = models.URLField(blank=True, null=True, default=None)
    attachment_type = models.CharField(max_length=32, blank=True, null=True,
                                       default=None)

    def __unicode__(self):
        return "{0}: {1}".format(self.user.username, self.message)

    def __repr__(self):
        return "<{0}, {1}>".format(ChatMessage, self.__unicode__())

    def save(self, *args, **kwargs):
        new = self.id is None

        logger.debug('Saving message {}'.format(self.message))
        super(ChatMessage, self).save(*args, **kwargs)
        if new:
            # Make URLs a link
            message = web_utils.url_filter(self.message)
            for k in ('message', 'attachment_url', 'attachment_type'):
                setattr(self, k, message[k])

            # Search for highlights
            self.message = notify_utils.ping_filter(
                self.message, UserProfile.objects.all(), self.user,
                'pinged you in chat', 'chat')
            self.save()
            # Push
            data = ChatMessageSerializer(instance=self)
            logger.info("sending chat to all: {}", data.data)
            send_all('chat', data.data)

    class Meta:
        ordering = ['-sent']


class ChatMessageSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    username = serializers.SerializerMethodField()

    class Meta:
        model = ChatMessage
        fields = ('id', 'message', 'sent', 'user', 'username',
                  'attachment_type', 'attachment_url')

    def get_username(self, obj):
        return obj.user.username
