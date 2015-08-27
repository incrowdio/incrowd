# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('website', '0007_auto_20150510_2050'),
        ('chat_server', '0002_chatmessage_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='chatmessage',
            name='crowd',
            field=models.ForeignKey(default=1, to='website.Crowd'),
            preserve_default=False,
        ),
    ]
