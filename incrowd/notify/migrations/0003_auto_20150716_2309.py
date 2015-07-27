# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('notify', '0002_auto_20150105_0749'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='notification',
            name='link',
        ),
        migrations.AddField(
            model_name='notification',
            name='identifier',
            field=models.CharField(max_length=64, null=True, blank=True),
        ),
    ]
