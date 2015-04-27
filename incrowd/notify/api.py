from __future__ import unicode_literals
import logging

from rest_framework import viewsets
from notify.models import Notification, NotificationSerializer

logger = logging.getLogger(__name__)


class NotificationViewSet(viewsets.ModelViewSet):
    model = Notification
    serializer_class = NotificationSerializer
    paginate_by = 10
    paginate_by_param = 'num_notifications'
    max_paginate_by = 20

    def get_queryset(self):
        user = self.request.user
        return Notification.objects.filter(user=user)
