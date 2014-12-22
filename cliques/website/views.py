from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponseNotFound, HttpResponse, \
    HttpResponseBadRequest
from django.shortcuts import render_to_response, redirect
from django.template import RequestContext
from website.models import Post, UserProfile
from django.conf import settings
from django.utils.importlib import import_module
import logging

logger = logging.getLogger(__name__)


def home(request):
    template_data = {}
    template_data['posts'] = Post.object.order_by('submitted')[:25]
    return render_to_response('homepage.html',
                              template_data,
                              context_instance=RequestContext(request))


def post(request, post_id):
    template_data = {}
    try:
        template_data['post'] = Post.object.get(id=post_id)
    except (Post.MultipleObjectsReturned, ObjectDoesNotExist):
        return HttpResponseNotFound("No post {}".format(post_id))
    return render_to_response('post.html',
                              template_data,
                              context_instance=RequestContext(request))


def warmup(request):
    """
    Provides default procedure for handling warmup requests on App
    Engine. Just add this view to your main urls.py.
    """
    for app in settings.INSTALLED_APPS:
        for name in ('urls', 'views', 'models'):
            try:
                import_module('%s.%s' % (app, name))
            except ImportError:
                pass
    content_type = 'text/plain; charset=%s' % settings.DEFAULT_CHARSET
    return HttpResponse("Warmup done.", content_type=content_type)


def user_redirect(request):
    return redirect('/users/{}'.format(request.user.username))


def presence(request):
    logger.info('Got presence event: {}'.format(request.POST))
    events = request.POST.get('events', [])
    for event in events:
        # Make sure it's a channel we care about
        if event.get('channel') not in [settings.PUSHER_CHANNEL,
                                        settings.PUSHER_PRESENCE]:
            logger.warning('Presence event for unknown channel: {}'.format(
                event.get('channel')))
            return HttpResponseNotFound('Unknown channel')
        if not event.get('user_id'):
            logger.warning('No user id')
            return HttpResponseNotFound('No user id')
        if event.get('name') == 'member_removed':
            # When a user logs off, update their user object
            try:
                user = UserProfile.objects.get(id=event.get('user_id'))
            except UserProfile.DoesNotExist:
                logger.warning('Got presence event for nonexistent user: {}'
                               .format(event['user_id']))
                return HttpResponseNotFound('Unknown user id')
            user.save()
            return HttpResponse('ok')
    return HttpResponseBadRequest('Bad request')
