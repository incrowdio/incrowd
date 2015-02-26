# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('website', '0002_auto_20150201_0011'),
    ]

    operations = [
        migrations.CreateModel(
            name='Crowd',
            fields=[
                ('name', models.CharField(help_text='The title of the site', max_length=64)),
                ('private', models.BooleanField(default=True, help_text='Determine if all posts require auth to see')),
                ('registration_type', models.CharField(help_text='How new users can be added', max_length=32, choices=[('invite', 'Invite By Current User'), ('open', 'Open to Everyone')])),
                ('maximum_size', models.IntegerField(default=100, help_text='The maximum number of users in the crowd')),
                ('web_root', models.CharField(default='/', help_text='Where the frontend files are served from, should end in a slash. Use "/" unless you are hosting the frontend files elsewhere (like Amazon S3)', max_length=255)),
                ('id', models.CharField(primary_key=True, serialize=False, editable=False, max_length=32, unique=True, db_index=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Theme',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=32)),
                ('web_root', models.CharField(help_text='Path from web_root where files are stored, should not start with a slash, should end with one.', max_length=255)),
                ('update_url', models.URLField(default=None, null=True, help_text='Path to the the archive containing the theme, for auto updating.', blank=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.AddField(
            model_name='crowd',
            name='theme',
            field=models.ForeignKey(to='website.Theme'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='userprofile',
            name='crowd',
            field=models.ForeignKey(default=1, to='website.Crowd'),
            preserve_default=False,
        ),
    ]
