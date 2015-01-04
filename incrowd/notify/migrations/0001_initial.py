# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('text', models.TextField()),
                ('type', models.CharField(max_length=64, choices=[(b'comment', b'comment'), (b'chat', b'chat')])),
                ('level', models.CharField(default=b'info', max_length=16, choices=[(b'debug', b'Debug'), (b'info', b'Info'), (b'success', b'Success'), (b'warning', b'Warning'), (b'error', b'Error')])),
                ('link', models.CharField(default=None, max_length=255, null=True, blank=True)),
                ('created_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['-created_at'],
            },
            bases=(models.Model,),
        ),
    ]
