from django.conf.urls import patterns, url


urlpatterns = patterns(
    '',
    url(r'check_in/$', 'push.views.check_in'),
    url(r'pusher/auth$', 'push.views.push_auth'),
    url(r'ionic/$', 'push.views.ionic_webhook')
)
