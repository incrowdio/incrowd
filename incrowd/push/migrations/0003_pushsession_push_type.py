# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('push', '0002_pushsession_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='pushsession',
            name='push_type',
            field=models.CharField(default='pusher', max_length=64, choices=[('website', 'pusher'), ('ionic', 'ionic')]),
        ),
    ]
