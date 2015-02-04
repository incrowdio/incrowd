# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('invite_only', '0002_invitecode_invited_by'),
    ]

    operations = [
        migrations.AlterField(
            model_name='invitecode',
            name='invited_email',
            field=models.EmailField(default=None, max_length=75, null=True, blank=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='invitecode',
            name='invited_name',
            field=models.CharField(default=None, max_length=64, null=True, blank=True),
            preserve_default=True,
        ),
    ]
