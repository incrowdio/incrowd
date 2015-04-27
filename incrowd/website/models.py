from __future__ import unicode_literals
import logging
import urlparse

from django.contrib.auth.models import AbstractUser
from django.core.mail import send_mail
from django.db import models, IntegrityError
from rest_framework import serializers

from djangle import form_api
from notify.models import notify_users
from notify import utils as notify_utils
from poll.models import VoteSerializer
from push.utils import send_all
from website.content_types import YouTube
from website import utils


logger = logging.getLogger(__name__)

POST_TYPES = (('link', 'link'), ('image', 'image'),
              ('video', 'video'), ('youtube', 'youtube'), ('text', 'text'),
              ('gifv', 'gifv'))

EMAIL_PREFERENCES = (('no', 'None'), ('posts', 'New Posts Only'),
                     ('all', 'Posts and Comments'))

CATEGORY_COLORS = (('red', 'Red'), ('blue', 'Blue'), ('purple', 'Purple'),
                   ('orange', 'Orange'), ('green', 'Green'))
REGISTRATION_CHOICES = (('invite', 'Invite By Current User'),
                        ('open', 'Open to Everyone'))


class Crowd(models.Model):
    name = models.CharField(
        max_length=64, help_text='The title of the site')
    private = models.BooleanField(
        default=True, help_text='Determine if all posts require auth to see')
    registration_type = models.CharField(
        max_length=32, choices=REGISTRATION_CHOICES,
        help_text='How new users can be added',
        default='invite')
    maximum_size = models.IntegerField(
        default=100, help_text='The maximum number of users in the crowd')
    web_root = models.CharField(
        max_length=255, default='/',
        help_text='Where the frontend files are served from, should end '
                  'in a slash. Use "/" unless you are hosting the frontend '
                  'files elsewhere (like Amazon S3)')
    id = models.CharField(max_length=32, editable=False, unique=True,
                          primary_key=True, db_index=True)

    def save(self, *args, **kwargs):
        if not self.pk:
            self.pk = utils.generate_pk(32)
        success = False
        failures = 0
        while not success:
            try:
                super(Crowd, self).save(*args, **kwargs)
            except IntegrityError:
                failures += 1
                if failures > 5:
                    raise
                else:
                    # looks like a collision, try another random value
                    self.auto_pseudoid = utils.generate_pk(32)
            else:
                success = True

    def __str__(self):
        return self.name

    def __repr__(self):
        return "<{0}, {1}>".format(Crowd, self.__str__())


class CrowdSerializer(serializers.ModelSerializer):
    class Meta:
        model = Crowd
        fields = ('id', 'name', 'private', 'registration_type', 'maximum_size',
                  'web_root')


class Theme(models.Model):
    name = models.CharField(max_length=32)
    web_root = models.CharField(
        max_length=255, help_text='Path from web_root where files are stored, '
                                  'should not start with a slash, should end '
                                  'with one.')
    update_url = models.URLField(blank=True, null=True, default=None,
                                 help_text='Path to the the archive containing'
                                           ' the theme, for auto updating.')
    crowd = models.ForeignKey('Crowd')

    def __unicode__(self):
        return self.name

    def __repr__(self):
        return "<{0}, {1}>".format(Theme, self.__unicode__())


class UserProfile(AbstractUser):
    profile_pic = models.URLField(
        default='https://storage.googleapis.com/cliques'
                'io.appspot.com/default_profile.jpg')
    email_settings = models.CharField(max_length=64, choices=EMAIL_PREFERENCES,
                                      default='posts')
    poll_votes = models.IntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)
    location = models.CharField(max_length=64, default=None, blank=True,
                                null=True)
    tagline = models.CharField(max_length=255, default=None, blank=True,
                               null=True)
    fantasy_team_url = models.URLField(
        default=None, blank=True, null=True,
        help_text="The URL when you click 'My Team'. e.g. 'http://games.espn."
                  "go.com/ffl/clubhouse?leagueId=1268962&teamId=8"
                  "&seasonId=2014'")
    crowd = models.ForeignKey('Crowd')

    def serialize(self):
        return UserSerializer(self)

    class Meta:
        ordering = ['last_updated']

    def __unicode__(self):
        return self.username

    def __repr__(self):
        return "<{0}, {1}>".format(UserProfile, self.__unicode__())


class Category(models.Model):
    crowd = models.ForeignKey('Crowd')
    created_by = models.ForeignKey(UserProfile)
    name = models.CharField(max_length=255)
    color = models.CharField(max_length=64, choices=CATEGORY_COLORS)

    def __unicode__(self):
        return self.name

    def __repr__(self):
        return "<{0}, {1}>".format(Category, self.__unicode__())


class Post(models.Model):
    crowd = models.ForeignKey('Crowd')
    submitted = models.DateTimeField(auto_now_add=True)
    edited = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(UserProfile)
    title = models.CharField(max_length=255)
    url = models.URLField(blank=True, null=True)
    type = models.CharField(max_length=64, choices=POST_TYPES, default="link")
    nsfw = models.BooleanField(default=False)
    category = models.ForeignKey(Category)

    def save(self, *args, **kwargs):
        new = self.id is None

        if self.url and 'imgur.com' in self.url:
            self.url = utils.imgur_preprocessor(self.url)

        self.type = utils.detect_post_type(self.url)
        logger.info('Post is of type: {}'.format(self.type))

        super(Post, self).save(*args, **kwargs)

        logger.info('type {} is {}'.format(self.title, self.type))
        if new:
            self._new_post_email()
            data = PostSerializer(instance=self)
            logger.info("sending post to all: {}".format(data.data))
            send_all('post', data.data)

    def _new_post_email(self):
        # TODO(pcsforeducation) Make async
        if self.type in ['youtube', 'video']:
            post_type = 'video'
        elif self.type == 'text':
            post_type = 'text post'
        elif self.type in ['imgur', 'image', 'gifv']:
            post_type = 'image'
        elif self.type == 'link':
            post_type = 'link'
        else:
            logger.warning('Post {} was of type none'.format(self.title))
            post_type = 'none'

        # Send email to everyone posts or all for new posts
        users_to_email = UserProfile.objects.filter(
            email_settings__in=['all', 'posts']) \
            .exclude(email=u'').values_list('email', flat=True)

        if not users_to_email:
            logger.info("No users to email for post {}. Whomp Whomp.".format(
                self.id))

        subject = '[slashertraxx] {} - {}'.format(self.title,
                                                  self.user.username)

        message = '''
        {username} posted a new {post_type} in {category}.

        {title}

        http://www.slashertraxx.com/#/posts/{id}

        To unsubscribe, go to http://slashertraxx.com/#/users
        '''.format(**{
            'username': self.user.username,
            'post_type': post_type,
            'id': self.id,
            'title': self.title,
            'url': self.url or '',
            'category': self.category.name
        })

        logger.info("Sending email to {}, subject {}, message {}".format(
            users_to_email, subject, message))
        try:
            send(users_to_email, subject, message)
        except Exception as e:
            logger.exception('Could not send email: {}: {} because: {}'.format(
                subject, message, str(e)))

    def youtube_video_id(self):
        youtube = YouTube()
        return youtube.youtube_video_id(self.url)

    def domain(self):
        try:
            url = urlparse.urlparse(self.url)
        except Exception:
            return "unknown"
        return url.netloc

    def get_permalink(self):
        return '/posts/{}'.format(self.id)

    def __unicode__(self):
        return "{0}: {1}".format(self.type, self.title)

    def __repr__(self):
        return "<{0}, {1}>".format(Post, self.__unicode__())

        # class Meta:
        # ordering = ["-submitted"]


notification_text = "{user} commented on: {title}"


class Comment(models.Model):
    crowd = models.ForeignKey('Crowd')
    user = models.ForeignKey(UserProfile)
    text = models.TextField()
    submitted = models.DateTimeField(auto_now_add=True)
    edited = models.DateTimeField(auto_now=True)
    post = models.ForeignKey(Post)
    attachment_url = models.URLField(blank=True, null=True, default=None)
    attachment_type = models.CharField(max_length=32, blank=True, null=True,
                                       default=None)

    def save(self, *args, **kwargs):
        new = self.id is None
        super(Comment, self).save(*args, **kwargs)

        if new:
            urls = utils.find_urls(self.text)
            # Only search the first URL
            if urls:
                utils.detect_link_type(urls[0])

            self.text = notify_utils.ping_filter(
                self.text, UserProfile.objects.all(), self.user,
                'mentioned you in a comment', 'comment',
                self.post.get_permalink())

            message = utils.url_filter(self.text)
            for k in ('attachment_url', 'attachment_type'):
                setattr(self, k, message[k])
            self.text = message['message']

            self.save()
            self._notify_users()
            data = CommentSerializer(instance=self)
            logger.info("sending comment to all: {}".format(data.data))
            send_all('comment', data.data)

    def _notify_users(self):
        other_users = set(
            Comment.objects.select_related().filter(post=self.post)
            .exclude(user=self.user).values_list('user', flat=True))
        # Add post auth
        if self.post.user_id not in other_users and \
                        self.post.user_id != self.user.id:
            other_users.add(self.post.user_id)
        logger.info('Notifying users of new comment: {}'.format(other_users))
        notify_users(
            user_ids=other_users,
            from_user=self.user,
            text=notification_text.format(**{
                'user': self.user.username,
                'title': self.post.title
            }),
            link=self.post.get_permalink(),
            type='comment',
            level='info')

    def __unicode__(self):
        return "{0}: {1}".format(self.user, self.text)

    def __repr__(self):
        return "<{0}, {1}>".format(Post, self.__unicode__())


def send(recipient_list, subject, body):
    from_email = "josh@slashertraxx.com"
    logging.info("Sending invite mail from {} to {}, subject: {}, "
                 "messages: {}.".format(
        from_email, recipient_list, subject, body))
    send_mail(subject, body, from_email, recipient_list)


class UserSerializer(serializers.ModelSerializer):
    user_votes = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = (
            'id', 'username', 'profile_pic', 'email', 'first_name',
            'last_name', 'poll_votes', 'user_votes', 'last_updated',
            'location', 'tagline', 'email_settings', 'crowd'
        )

    def get_user_votes(self, obj):
        return VoteSerializer(obj.user_votes.all(), many=True,
                              read_only=True).data


class CategorySerializer(serializers.ModelSerializer):
    crowd = CrowdSerializer(read_only=True)
    post_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ('id', 'created_by', 'name', 'color', 'post_count', 'crowd')


class PostSerializer(serializers.ModelSerializer):
    url = serializers.URLField(required=False)
    user = UserSerializer(read_only=True)
    crowd = CrowdSerializer(read_only=True)
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Post
        fields = ('id', 'submitted', 'edited', 'user', 'title', 'url', 'type',
                  'category', 'comment_set', 'nsfw', 'crowd')
        depth = 1


class PostDetailSerializer(serializers.ModelSerializer):
    # Take performance hit serializing comments for details
    # TODO(pcsforeducation) fix this and combine with PostSerializer
    url = serializers.URLField(required=False)
    user = UserSerializer(read_only=True)
    comment_set = serializers.SerializerMethodField('get_comment_set')
    crowd = CrowdSerializer(read_only=True)

    class Meta:
        model = Post
        fields = ('id', 'submitted', 'edited', 'user', 'title', 'url', 'type',
                  'category', 'comment_set', 'nsfw', 'crowd')
        depth = 1

    def get_comment_set(self, obj):
        return CommentSerializer(obj.comment_set.all(), many=True,
                                 read_only=True).data


class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    username = serializers.SerializerMethodField()
    crowd = CrowdSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ('id', 'user', 'text', 'submitted', 'edited', 'post',
                  'username', 'attachment_url', 'attachment_type', 'crowd')

    def get_username(self, obj):
        return obj.user.username


form_api.api.register('posts', PostSerializer)
form_api.api.register('comments', CommentSerializer)
form_api.api.register('categories', CategorySerializer)
form_api.api.register('user_profiles', UserSerializer)
