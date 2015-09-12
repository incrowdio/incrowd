from __future__ import unicode_literals
import datetime

from django.http import HttpResponse

from website.models import UserProfile, Post, Category

WEEK_1 = {
    2015: 36
}

MAX_WEEKS = 17


def cron(request):
    current_year = datetime.datetime.now().year
    # TODO(pcsforeducation) Refactor into a config object
    # TODO(pcsforeducation) filter by crowd id
    user = UserProfile.objects.get(username='shivablast')
    week = datetime.datetime.now().isocalendar()[1] - WEEK_1[current_year]
    if week > MAX_WEEKS:
        # Avoid "week -35"
        return HttpResponse('Past week {}, ignoring'.format(MAX_WEEKS),
                            status=400)
    category = Category.objects.get(name='Fantasy')
    post = Post(user=user,
                category=category,
                title="Official Week {} Shit Talk Thread".format(week),
                type='text',
                crowd=user.crowd)
    post.save()
    return HttpResponse('OK')
