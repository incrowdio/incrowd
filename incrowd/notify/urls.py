from rest_framework import routers
from notify.api import NotificationViewSet

router = routers.SimpleRouter()
router.register(r'notifications', NotificationViewSet,
                base_name='notifications')
