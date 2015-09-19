from django.conf.urls import patterns, url


urlpatterns = patterns(
    url(r'cron', 'plugins.fantasy.views.cron'),
)
