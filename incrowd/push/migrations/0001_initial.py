# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='PushSession',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('started', models.DateTimeField(auto_now_add=True)),
                ('last_update', models.DateTimeField(auto_now=True, db_index=True)),
                ('session_key', models.CharField(default=None, unique=True, max_length=255, db_index=True)),
                ('ended', models.DateTimeField(default=None, null=True, blank=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
