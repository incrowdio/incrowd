# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('website', '0004_auto_20150225_0621'),
    ]

    operations = [
        migrations.AlterField(
            model_name='category',
            name='crowd',
            field=models.ForeignKey(to='website.Crowd'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='comment',
            name='crowd',
            field=models.ForeignKey(to='website.Crowd'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='post',
            name='crowd',
            field=models.ForeignKey(to='website.Crowd'),
            preserve_default=True,
        ),
    ]
