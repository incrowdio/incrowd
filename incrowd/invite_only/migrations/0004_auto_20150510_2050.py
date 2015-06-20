# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('invite_only', '0003_auto_20150201_1938'),
    ]

    operations = [
        migrations.AlterField(
            model_name='invitecode',
            name='invited_email',
            field=models.EmailField(default=None, max_length=254, null=True, blank=True),
        ),
    ]
