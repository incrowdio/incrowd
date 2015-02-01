# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('website', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='post',
            name='type',
            field=models.CharField(default=b'link', max_length=64, choices=[(b'link', b'link'), (b'image', b'image'), (b'video', b'video'), (b'youtube', b'youtube'), (b'text', b'text'), (b'gifv', b'gifv')]),
            preserve_default=True,
        ),
    ]
