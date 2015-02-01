from __future__ import unicode_literals

from django.contrib import admin

from invite_only.models import InviteCode


admin.site.register(InviteCode)
