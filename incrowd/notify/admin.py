from __future__ import unicode_literals

from django.contrib import admin

from notify.models import Notification


admin.site.register(Notification)
