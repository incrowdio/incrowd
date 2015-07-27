# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('website', '0007_auto_20150510_2050'),
        ('invite_only', '0004_auto_20150510_2050'),
    ]

    operations = [
        migrations.AddField(
            model_name='invitecode',
            name='crowd',
            field=models.ForeignKey(default=1, to='website.Crowd'),
            preserve_default=False,
        ),
    ]
