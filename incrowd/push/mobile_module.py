from __future__ import unicode_literals
import logging

from push_notifications.models import APNSDevice, GCMDevice

logger = logging.getLogger()

URL = {
    'chat': 'chat/messages/{id}/',
    'post': 'posts/{id}/',
    'comment': 'comments/{id}/',
    'notify': 'notifications/{id}/'
}


def _get_message(message_type, message, crowd, user=None):
    """Returns kwargs for send_message()"""
    return {
        'message': None,
        # 'collapse_key': message_type,

        'extra': {
            'title': None,
            'type': message_type,
            'id': message.get('id'),
            'link': URL[message_type].format(id=message.get('id'))
        }
    }


def send_all(message_type, message, crowd, user=None):
    logger.info("msg {}".format(message))
    # data = JSONRenderer().render(message)
    ios_devices = APNSDevice.objects.all()
    android_devices = GCMDevice.objects.all()
    logger.info("{} android devices, {} ios".format(android_devices.count(),
                                                    ios_devices.count()))
    kwargs = _get_message(message_type, message, crowd, user)
    logger.info("Sending to mobiles: {}:{}".format(message_type, kwargs))

    try:
        # android_devices.send_message(**kwargs)
        android_devices.send_message(**kwargs)
        # android_devices.send_message(None, badge=1, extra={"foo": "bar"})
    except Exception as e:
        logger.exception(
            'Unable to send requests to Android push: {}'.format(e))
    try:
        print(ios_devices.send_message(**kwargs))
    except Exception as e:
        logger.exception('Unable to send requests to iOS push: {}'.format(e))
