from __future__ import unicode_literals

from django.contrib import admin

from chat_server.models import ChatMessage


admin.site.register(ChatMessage)
