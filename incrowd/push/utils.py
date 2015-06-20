from __future__ import unicode_literals
import logging

from django.conf import settings

from push import mobile_module
from push import pusher_module

logger = logging.getLogger()


def send_all(message_type, message, crowd, user=None):
    if settings.PUSH_DISABLED:
        logger.info('Push disabled, skipping push')
        return
    if settings.PUSH_MODULE == 'pusher':
        pusher_module.send_all(message_type, message, crowd, user)
    # Send to all the mobile devices attached to the user (or all if user
    # is None)
    mobile_module.send_all(message_type, message, crowd, user)
