# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import invite_only.models


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='InviteCode',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('code', models.CharField(default=invite_only.models.random_code, unique=True, max_length=32)),
                ('used', models.BooleanField(default=False)),
                ('invited_email', models.EmailField(max_length=75)),
                ('invited_name', models.CharField(max_length=64)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
