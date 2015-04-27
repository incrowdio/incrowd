from django.conf import settings

from push import pusher_module


def send_all(message_type, message, user=None):
    if settings.PUSH_MODULE == 'pusher':
        return pusher_module.send_all(message_type, message, user)
