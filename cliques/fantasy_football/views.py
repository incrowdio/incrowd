# Create your views here.
import datetime

from django.http import HttpResponse

from website.models import UserProfile, Post, Category

WEEK_1 = 35


def cron(request):
    # Get all the votes (may need to improve filtering on poll here).
    # TODO(pcsforeducation) support multiple polls
    user = UserProfile.objects.get(username='shivablast')
    week = datetime.datetime.now().isocalendar()[1] - WEEK_1
    category = Category.objects.get(name='Fantasy')
    post = Post(user=user,
                category=category,
                title="Official Week {} Shit Talk Thread".format(week),
                type='text')
    post.save()
    return HttpResponse('OK')
