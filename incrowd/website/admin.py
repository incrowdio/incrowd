from __future__ import unicode_literals

from django.contrib import admin

from website.models import Comment, Post, Category, UserProfile, Theme, Crowd


admin.site.register(Post)
admin.site.register(Comment)
admin.site.register(UserProfile)
admin.site.register(Category)
admin.site.register(Theme)
admin.site.register(Crowd)
