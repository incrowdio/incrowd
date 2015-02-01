from __future__ import unicode_literals
import logging

from django.db import models
from rest_framework import serializers

from push.models import send_all


logger = logging.getLogger(__name__)

NOTIFICATION_TYPES = (('comment', 'comment'), ('chat', 'chat'))
NOTIFICATION_LEVELS = (('debug', 'Debug'), ('info', 'Info'),
                       ('success', 'Success'), ('warning', 'Warning'),
                       ('error', 'Error'))


class Notification(models.Model):
    text = models.TextField()
    user = models.ForeignKey('website.UserProfile')
    from_user = models.ForeignKey('website.UserProfile',
                                  related_name='from_user_set')
    type = models.CharField(max_length=64, choices=NOTIFICATION_TYPES)
    level = models.CharField(max_length=16, choices=NOTIFICATION_LEVELS,
                             default='info')
    link = models.CharField(max_length=255, default=None,
                            blank=True, null=True)
    created_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        new = self.id is None
        super(Notification, self).save(*args, **kwargs)
        if new:
            data = NotificationSerializer(instance=self)
            logger.info("sending notification {} to {}".format(data.data,
                                                               self.user))
            send_all('notify', data.data, user=self.user)

    class Meta:
        ordering = ['-created_at']

    def __unicode__(self):
        return "{}: {}".format(self.user.username, self.text)

    def __repr__(self):
        return self.__unicode__()


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('id', 'text', 'user', 'type', 'level', 'link',
                  'created_at')


def notify_users(user_ids, from_user, text, link, type, level):
    for user in user_ids:
        # NOTE(pcsforeducation) Redo this as bulk create, then call notify on
        # Each object. bulk_create doesn't call .save(), where push notify is.
        n = Notification(user_id=user,
                         from_user=from_user,
                         text=text,
                         type=type,
                         link=link,
                         level=level)
        n.save()
