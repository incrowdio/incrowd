from __future__ import unicode_literals

from rest_framework import viewsets

from notify.models import Notification, NotificationSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    """
    List all snippets, or create a new snippet.
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
