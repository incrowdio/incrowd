from __future__ import unicode_literals
import logging

from rest_framework import viewsets

from .models import ChatMessage, ChatMessageSerializer

logger = logging.getLogger(__name__)


class ChatMessageViewSet(viewsets.ModelViewSet):
    serializer_class = ChatMessageSerializer
    queryset = ChatMessage.objects.all()

    paginate_by = 50
    paginate_by_param = 'messages'
    max_paginate_by = 1000

    def perform_create(self, serializer):
        serializer.save(user=self.request.user,
                        crowd=self.request.user.crowd)
