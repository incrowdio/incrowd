from __future__ import unicode_literals

from django.conf.urls import patterns, include, url
from django.conf import settings
from django.contrib import admin

import chat_server.urls
from incrowd.views import get_token, get_cookie
import invite_only.urls
import notify.urls
# TODO(pcsforeducation) update this to use Django's app system
import poll.urls
import website.urls
from website.views import presence

admin.autodiscover()

urlpatterns = patterns(
    '',
    url(r'^admin/', include(admin.site.urls)),
    url(r'^api/v1/auth/', include('djoser.urls')),
    url(r'^api/v1/cron/poll/$', 'poll.views.cron'),

    # Djangle
    url(r'^api/_forms', 'djangle.views.render_serializers'),

    # API
    url(r'^api/api-auth/', include('rest_framework.urls',
                                   namespace='rest_framework')),
    url(r'^api/v1/', include(website.urls.router.urls)),
    url(r'^api/v1/', include(notify.urls.router.urls)),
    url(r'^api/v1/', include(chat_server.urls.router.urls)),
    url(r'^api/v1/', include(poll.urls.router.urls)),
    url(r'^api/v1/', include(invite_only.urls.router.urls)),
    url(r'^api/v1/', include('push.urls')),
    url(r'^api/v1/fantasy/cron/$', 'plugins.fantasy.views.cron'),

    url(r'^api/v1/register/', 'website.api.register'),
    url(r'^api/v1/presence/$', presence),

    url(r'^api/v1/token/', get_token),
    url(r'^api/cookie/', get_cookie),

)

if settings.DEBUG_TOOLBAR:
    import debug_toolbar

    urlpatterns += patterns(
        '',
        url(r'^__debug__/', include(debug_toolbar.urls)),
    )

if settings.DEBUG:
    urlpatterns += patterns(
        '',
        url(r'^$', 'django.contrib.staticfiles.views.serve',
            kwargs={
                'path': 'index.html',
                # 'document_root': settings.STATIC_ROOT
            }),
        url(r'^(?P<path>.*)$',
            'django.contrib.staticfiles.views.serve', {
                # 'document_root': settings.STATIC_ROOT,
                'show_indexes': True
            }),
    )
