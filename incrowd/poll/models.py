from __future__ import unicode_literals

from django.core.exceptions import ValidationError
from django.db import models
from rest_framework import serializers

from website.models import UserSerializer
from website import utils

FREQUENCY_CHOICES = (('daily', 'daily'), ('once', 'once'))


class Poll(models.Model):
    title = models.CharField(max_length=255)
    stub = models.CharField(max_length=32)
    bot_name = models.CharField(max_length=32)
    category = models.ForeignKey('website.Category')
    # In hours
    frequency = models.IntegerField(default=24)
    # In hours, when old submissions that haven't won will be removed
    submission_removal = models.IntegerField(default=7 * 24)
    winning_text = models.CharField(max_length=255, blank=True, null=True)
    crowd = models.ForeignKey('website.Crowd')

    def __unicode__(self):
        return self.title


class Submission(models.Model):
    title = models.CharField(max_length=255)
    url = models.URLField()
    submitted = models.DateTimeField(auto_now_add=True)
    votes = models.ManyToManyField('website.UserProfile', through='Vote')
    poll = models.ForeignKey(Poll, related_name='poll_submissions')
    user = models.ForeignKey('website.UserProfile',
                             related_name='user_submissions')
    crowd = models.ForeignKey('website.Crowd')

    def save(self, *args, **kwargs):
        if Submission.objects.filter(user=self.user).count() > 4:
            raise ValidationError('More than 5 submissions.')
        super(Submission, self).save(*args, **kwargs)
        # Check if text field is
        self.type = utils.detect_post_type(self.url)

    def __unicode__(self):
        return "{}: {}".format(self.user, self.title)


class Vote(models.Model):
    crowd = models.ForeignKey('website.Crowd')
    submission = models.ForeignKey(Submission, related_name='submission_votes')
    user = models.ForeignKey('website.UserProfile',
                             related_name='user_votes')
    day = models.DateField(auto_now_add=True)

    def validate_unique(self, exclude=None):
        super(Vote, self).validate_unique(exclude)
        if Vote.objects.filter(user=self.user).count() > 2:
            raise ValidationError('More than 3 votes.')

    def __unicode__(self):
        return "{} voted on {} on {}".format(self.user.username,
                                             self.submission.title,
                                             self.day)


class SubmissionSerializer(serializers.ModelSerializer):
    crowd = serializers.CharField(max_length=64, read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = Submission
        fields = ('title', 'url', 'submitted', 'poll', 'id', 'crowd', 'user')


class PollSerializer(serializers.ModelSerializer):
    crowd = serializers.CharField(max_length=64, read_only=True)

    class Meta:
        model = Poll
        fields = ('title', 'stub', 'bot_name', 'category',
                  'frequency', 'submission_removal', 'winning_text',
                  'poll_submissions', 'id', 'crowd')

        depth = 1


class VoteSerializer(serializers.ModelSerializer):
    crowd = serializers.CharField(max_length=64, read_only=True)
    day = serializers.CharField(read_only=True)
    user = UserSerializer(read_only=True)
    class Meta:
        model = Vote
        fields = ('submission', 'user', 'day', 'id', 'crowd')
