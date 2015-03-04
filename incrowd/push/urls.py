from django.conf.urls import patterns, url
from push.views import push_auth

urlpatterns = patterns(
    '',
    url(r'check_in/$', 'push.views.check_in'),
    url(r'pusher/auth$', push_auth),
)