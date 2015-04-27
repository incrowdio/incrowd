# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('website', '0006_auto_20150304_0850'),
        ('poll', '0002_auto_20150105_0749'),
    ]

    operations = [
        migrations.AddField(
            model_name='poll',
            name='crowd',
            field=models.ForeignKey(default=1, to='website.Crowd'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='submission',
            name='crowd',
            field=models.ForeignKey(default=1, to='website.Crowd'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='vote',
            name='crowd',
            field=models.ForeignKey(default=1, to='website.Crowd'),
            preserve_default=False,
        ),
    ]
