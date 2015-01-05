# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('website', '0001_initial'),
        ('poll', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='poll',
            name='category',
            field=models.ForeignKey(default=1, to='website.Category'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='submission',
            name='poll',
            field=models.ForeignKey(related_name='poll_submissions', default=1, to='poll.Poll'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='submission',
            name='user',
            field=models.ForeignKey(related_name='user_submissions', default=1, to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='submission',
            name='votes',
            field=models.ManyToManyField(to=settings.AUTH_USER_MODEL, through='poll.Vote'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='vote',
            name='user',
            field=models.ForeignKey(related_name='user_votes', default=1, to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
    ]
