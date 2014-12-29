import logging

from notify.models import Notification


logger = logging.getLogger(__name__)


def ping_filter(message, users, sending_user, notify_text, notify_type,
                notify_url=None):
    for user in users:
        if username_in_message(message, user.username):
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


def username_in_message(message, username):
    message = message.lower()
    username = username.lower()
    # Check if @username in message. Edge case for username at the end of
    # the message.
    if '@' + username + ' ' in message.lower():
        return True
    try:
        return (message.index('@' + username) ==
                len(message.lower()) - len('@' + username))
    except ValueError:
        return False