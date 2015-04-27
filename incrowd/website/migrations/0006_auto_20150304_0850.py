# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('website', '0005_auto_20150226_0707'),
    ]

    operations = [
        migrations.AlterField(
            model_name='crowd',
            name='registration_type',
            field=models.CharField(default='invite', help_text='How new users can be added', max_length=32, choices=[('invite', 'Invite By Current User'), ('open', 'Open to Everyone')]),
            preserve_default=True,
        ),
    ]
