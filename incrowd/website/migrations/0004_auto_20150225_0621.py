# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('website', '0003_auto_20150225_0607'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='crowd',
            name='theme',
        ),
        migrations.AddField(
            model_name='category',
            name='crowd',
            field=models.CharField(default=1, max_length=32),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='comment',
            name='crowd',
            field=models.CharField(default=1, max_length=32),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='post',
            name='crowd',
            field=models.CharField(default=1, max_length=32),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='theme',
            name='crowd',
            field=models.ForeignKey(default=1, to='website.Crowd'),
            preserve_default=False,
        ),
    ]
