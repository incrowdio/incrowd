# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='ChatMessage',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('message', models.TextField()),
                ('sent', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('attachment_url', models.URLField(default=None, null=True, blank=True)),
                ('attachment_type', models.CharField(default=None, max_length=32, null=True, blank=True)),
            ],
            options={
                'ordering': ['-sent'],
            },
            bases=(models.Model,),
        ),
    ]
