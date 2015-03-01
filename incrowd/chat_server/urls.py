from rest_framework import routers
from chat_server.api import ChatMessageViewSet

router = routers.SimpleRouter()
router.register(r'chat/messages', ChatMessageViewSet)
