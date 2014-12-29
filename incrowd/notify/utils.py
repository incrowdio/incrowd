import logging

from notify.models import Notification


logger = logging.getLogger(__name__)


def ping_filter(message, users, sending_user, notify_text, notify_type,
                notify_url=None):
    for user in users:
        # Check if @username in message. Edge case for username at the end of
        # the message.
        if ('@' + user.username.lower() + ' ' in message.lower() or
                message.index('@' + user.username.lower()) ==
                len(message.lower()) - len('@' + user.username.lower())):
            # Create notification
            if user == sending_user:
                continue
            note = Notification(
                text='{} {}: {}'.format(
                    sending_user.username, notify_text, message),
                user=user,
                from_user=sending_user,
                type=notify_type,
                link=notify_url)
            note.save()
            logger.info("Created notification for user {} from {}"
                        .format(note))
    return message
