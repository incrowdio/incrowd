from django.contrib import admin

from poll.models import Poll, Submission, Vote

admin.site.register(Poll)
admin.site.register(Submission)
admin.site.register(Vote)
