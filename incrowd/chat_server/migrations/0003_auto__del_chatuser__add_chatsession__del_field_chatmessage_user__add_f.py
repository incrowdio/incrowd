# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Deleting model 'ChatUser'
        db.delete_table(u'chat_server_chatuser')

        # Adding model 'ChatSession'
        db.create_table(u'chat_server_chatsession', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['website.UserProfile'])),
            ('started', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('last_update', self.gf('django.db.models.fields.DateTimeField')(auto_now=True, db_index=True, blank=True)),
            ('session_key', self.gf('django.db.models.fields.CharField')(default='0FC8215DDEC099B43739C78135AF0AA707923DC3BE702C1D728C9699FD64DD71', unique=True, max_length=255, db_index=True)),
            ('ended', self.gf('django.db.models.fields.DateTimeField')(default=None, null=True, blank=True)),
        ))
        db.send_create_signal(u'chat_server', ['ChatSession'])

        # Deleting field 'ChatMessage.user'
        db.delete_column(u'chat_server_chatmessage', 'user_id')

        # Adding field 'ChatMessage.session'
        db.add_column(u'chat_server_chatmessage', 'session',
                      self.gf('django.db.models.fields.related.ForeignKey')(default=1, to=orm['chat_server.ChatSession']),
                      keep_default=False)

        # Adding index on 'ChatMessage', fields ['sent']
        db.create_index(u'chat_server_chatmessage', ['sent'])


    def backwards(self, orm):
        # Removing index on 'ChatMessage', fields ['sent']
        db.delete_index(u'chat_server_chatmessage', ['sent'])

        # Adding model 'ChatUser'
        db.create_table(u'chat_server_chatuser', (
            ('connected_at', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('token', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['website.UserProfile'])),
        ))
        db.send_create_signal(u'chat_server', ['ChatUser'])

        # Deleting model 'ChatSession'
        db.delete_table(u'chat_server_chatsession')


        # User chose to not deal with backwards NULL issues for 'ChatMessage.user'
        raise RuntimeError("Cannot reverse this migration. 'ChatMessage.user' and its values cannot be restored.")
        
        # The following code is provided here to aid in writing a correct migration        # Adding field 'ChatMessage.user'
        db.add_column(u'chat_server_chatmessage', 'user',
                      self.gf('django.db.models.fields.related.ForeignKey')(to=orm['website.UserProfile']),
                      keep_default=False)

        # Deleting field 'ChatMessage.session'
        db.delete_column(u'chat_server_chatmessage', 'session_id')


    models = {
        u'auth.group': {
            'Meta': {'object_name': 'Group'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        u'auth.permission': {
            'Meta': {'ordering': "(u'content_type__app_label', u'content_type__model', u'codename')", 'unique_together': "((u'content_type', u'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['contenttypes.ContentType']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        u'chat_server.chatmessage': {
            'Meta': {'object_name': 'ChatMessage'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'message': ('django.db.models.fields.TextField', [], {}),
            'sent': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'db_index': 'True', 'blank': 'True'}),
            'session': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['chat_server.ChatSession']"})
        },
        u'chat_server.chatsession': {
            'Meta': {'object_name': 'ChatSession'},
            'ended': ('django.db.models.fields.DateTimeField', [], {'default': 'None', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_update': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'db_index': 'True', 'blank': 'True'}),
            'session_key': ('django.db.models.fields.CharField', [], {'default': "'51E0441F54FF4B1477988162AAA3E140AEE77FDAD60C0F046423253471022577'", 'unique': 'True', 'max_length': '255', 'db_index': 'True'}),
            'started': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['website.UserProfile']"})
        },
        u'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        u'website.userprofile': {
            'Meta': {'object_name': 'UserProfile'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'email_settings': ('django.db.models.fields.CharField', [], {'default': "'posts'", 'max_length': '64'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'related_name': "u'user_set'", 'blank': 'True', 'to': u"orm['auth.Group']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'poll_votes': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'profile_pic': ('django.db.models.fields.files.ImageField', [], {'default': 'None', 'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'related_name': "u'user_set'", 'blank': 'True', 'to': u"orm['auth.Permission']"}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
        }
    }

    complete_apps = ['chat_server']