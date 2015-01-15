import logging

from rest_framework import generics

from .models import ChatMessage, ChatMessageSerializer

logger = logging.getLogger(__name__)


class ChatMessageList(generics.ListCreateAPIView):
    model = ChatMessage
    serializer_class = ChatMessageSerializer

    paginate_by = 50
    paginate_by_param = 'messages'
    max_paginate_by = 1000

    def pre_save(self, obj):
        obj.user = self.request.user
        super(ChatMessageList, self).pre_save(obj)


class ChatMessageDetail(generics.RetrieveUpdateDestroyAPIView):
    model = ChatMessage
    serializer_class = ChatMessageSerializer
