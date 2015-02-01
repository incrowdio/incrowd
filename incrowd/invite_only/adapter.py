from __future__ import unicode_literals
import logging

from allauth.account.adapter import DefaultAccountAdapter

from invite_only.models import InviteCode


logger = logging.getLogger(__name__)


class InviteOnlyAccountAdapter(DefaultAccountAdapter):
    def is_open_for_signup(self, request):
        if request.method == 'GET':
            logger.info("is oepn for signup {} {}".format(
                request.GET, request.POST))
            invite_code = self._get_invite(request)
            # If None, return False
            return invite_code is not None
        else:
            return True

    def stash_verified_email(self, request, email):
        request.session['account_verified_email'] = email

    def is_email_verified(self, request, email):
        return True

    def save_user(self, request, user, form, commit=True):
        super(InviteOnlyAccountAdapter, self).save_user(
            request, user, form, commit=True)

    def _get_invite(self, request):
        """
        Returns the InviteCode object or None if it doesn't exist
        """
        logger.info('get {}, post: {}'.format(request.GET, request.POST))
        invite_code = request.GET.get('invite_code')
        logger.debug('Got invite_code {}'.format(invite_code))
        try:
            return InviteCode.objects.get(code=invite_code)
        except (InviteCode.MultipleObjectsReturned, InviteCode.DoesNotExist):
            logger.exception('Invalid invite code {}'.format(invite_code))
            return None
