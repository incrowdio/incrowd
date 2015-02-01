from __future__ import unicode_literals
import random
from urllib import urlencode
import logging

from django.core.mail import send_mail
from django.db import models
from django import forms
from django.conf import settings


logger = logging.getLogger(__name__)


def random_code():
    return '%08x' % random.randrange(16 ** 8)


def send(recipient_list, subject, body):
    from_email = "josh@slashertraxx.com"
    logging.info("Sending invite mail from {} to {}, subject: {}, "
                 "messages: {}.".format(
        from_email, recipient_list, subject, body))
    send_mail(subject, body, from_email, recipient_list)


class InviteCode(models.Model):
    invited_by = models.ForeignKey(settings.AUTH_USER_MODEL)
    code = models.CharField(max_length=32, default=random_code, unique=True)
    used = models.BooleanField(default=False)
    invited_email = models.EmailField()
    invited_name = models.CharField(max_length=64)
    # TODO(pcsforeducation) Add site FK

    def save(self, *args, **kwargs):
        created = not self.id
        super(InviteCode, self).save(*args, **kwargs)

        if created:
            self.send_code()

    def send_code(self):
        query = {
            'email': self.invited_email,
            'code': self.code,
            'name': self.invited_name
        }
        query_string = urlencode(query)
        subject = "SlasherTraxx Invite"
        body = """Hey {name}!

{users_name} invited you to join Slashertraxx, a private social network.
To sign up, go to:

{hostname}/#/accounts/signup?{query}
        """.format(**{
            'users_name': (self.invited_by.get_full_name() or
                           self.invited_by.username),
            'name': self.invited_name,
            'query': query_string,
            'hostname': 'http://www.slashertraxx.com'

        })
        from_email = "josh@slashertraxx.com"
        recipient_list = [self.invited_email]
        logging.info("Sending invite mail from {} to {}, subject: {}, "
                     "messages: {}.".format(
                         from_email, recipient_list, subject, body))
        try:
            send(recipient_list, subject, body)
        except Exception as e:
            logger.exception('Could not send email: {}: {} because: {}'.format(
                subject, body, str(e)))


class InviteForm(forms.Form):
    email = forms.EmailField()
    name = forms.CharField()
