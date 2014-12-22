from django.contrib import admin
from website.models import Comment, Post, Category, UserProfile


admin.site.register(Post)
admin.site.register(Comment)
admin.site.register(UserProfile)
admin.site.register(Category)
