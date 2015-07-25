"""
URLconf for registration and activation, using django-registration's
default backend.

If the default behavior of these views is acceptable to you, simply
use a line like this in your root URLconf to set up the default URLs
for registration::

    (r'^accounts/', include('registration.backends.default.urls')),

This will also automatically set up the views in
``django.contrib.auth`` at sensible default locations.

If you'd like to customize registration behavior, feel free to set up
your own URL patterns for these views instead.

"""

from __future__ import unicode_literals

from rest_framework import routers

from invite_only.api import InviteCodeViewSet

router = routers.SimpleRouter()
router.register(r'invite', InviteCodeViewSet)
