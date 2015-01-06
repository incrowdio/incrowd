from api.views import get_token, get_cookie
from django.conf.urls import patterns, include, url
from django.conf import settings
from notify.api import NotificationViewSet
from push.api import PushSessionList
from website.views import presence
from django.contrib import admin
from invite_only.api import InviteCodeView, InviteCodeDetail
from website.api import PostList, PostDetail, PostCommentList, CategoryList, \
    CategoryDetail, UserList, UserDetail, CommentList, \
    CommentDetail, CategoryTopAPI
from poll.api import SubmissionList, PollDetail, PollList, \
    VoteDetail, VoteList, SubmissionDetail
from chat_server.api import ChatMessageList
from push.views import pusher_auth

admin.autodiscover()

v1_post_urls = patterns(
    '',
    url(r'^posts/$',
        PostList.as_view(),
        name='post-list'),
    url(r'^posts/(?P<pk>\d+)/$',
        PostDetail.as_view(),
        name='post-detail'),
    url(r'^posts/(?P<pk>\d+)/comments/$',
        PostCommentList.as_view(),
        name='post-comment-list'),
)

v1_comment_urls = patterns(
    '',
    url(r'^comments/$',
        CommentList.as_view(),
        name='comment-list'),
    url(r'^comments/(?P<pk>\d+)/$',
        CommentDetail.as_view(),
        name='comment-detail')
)

v1_poll_urls = patterns(
    '',
    url(r'^polls/$',
        PollList.as_view(),
        name='poll-list'),
    url(r'^polls/(?P<stub>[A-Za-z0-9_]+)/$',
        PollDetail.as_view(),
        name='poll-detail'),
    url(r'^polls/(?P<stub>[A-Za-z0-9_]+)/submissions/$',
        SubmissionList.as_view(),
        name='submission-list'),
)

v1_submission_urls = patterns(
    '',
    url(r'^submissions/$',
        SubmissionList.as_view(),
        name='poll-list'),
    url(r'^submissions/(?P<pk>\d+)/$',
        SubmissionDetail.as_view(),
        name='poll-detail'),
)

v1_push_urls = patterns(
    '',
    url(r'^push/$',
        PushSessionList.as_view(),
        name='push-session-list'),
)

v1_category_urls = patterns(
    '',
    url(r'^categories/$',
        CategoryList.as_view(),
        name='category-list'),
    url(r'^categories/(?P<pk>\d+)/$',
        CategoryDetail.as_view(),
        name='category-detail'),
)

v1_user_urls = patterns(
    '',
    url(r'^users/$',
        UserList.as_view(),
        name='user-list'),
    url(r'^users/(?P<username>[A-Za-z0-9_]+)/$',
        UserDetail.as_view(),
        name='user-detail'),
    # url(r'^register/$',
    # UserCreate.as_view(),
    # name='user-create'),
)

v1_notification_urls = patterns(
    '',
    url(r'^notifications/$',
        NotificationViewSet.as_view(),
        name='notifications')
)

v1_chat_urls = patterns(
    '',
    url(r'^chat/messages/$',
        ChatMessageList.as_view(),
        name='chat-messages'),
)

v1_vote_urls = patterns(
    '',
    url(r'^votes/$',
        VoteList.as_view(),
        name='vote-list'),
    url(r'^votes/(?P<pk>\d+)/$',
        VoteDetail.as_view(),
        name='vote-detail')
)

v1_invite_urls = patterns(
    '',
    url(r'^invites/$',
        InviteCodeView.as_view(),
        name='invite-list'),
    url(r'^invites/(?P<code>\w+)/$',
        InviteCodeDetail.as_view(),
        name='invite-details'),
)

notification_list = NotificationViewSet.as_view({
    'get': 'list',
    'post': 'create'
})
notification_detail = NotificationViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

urlpatterns = patterns(
    '',
    url(r'^admin/', include(admin.site.urls)),

    url(r'^api/v1/cron/poll/$', 'poll.views.cron'),
    url(r'^api/v1/cron/fantasy/$', 'fantasy_football.views.cron'),

    # Djangle
    url(r'^api/_forms', 'djangle.views.render_serializers'),

    # API
    url(r'^api/api-auth/', include('rest_framework.urls',
                                   namespace='rest_framework')),
    url(r'^api/v1/', include(v1_post_urls)),
    url(r'^api/v1/', include(v1_comment_urls)),
    url(r'^api/v1/', include(v1_user_urls)),
    url(r'^api/v1/register', 'website.api.register'),
    url(r'^api/v1/', include(v1_poll_urls)),
    url(r'^api/v1/', include(v1_submission_urls)),
    url(r'^api/v1/', include(v1_chat_urls)),
    url(r'^api/v1/', include(v1_category_urls)),
    url(r'^api/v1/categories/top/$', CategoryTopAPI.as_view(),
        name='top-categories'),
    url(r'^api/v1/', include(v1_vote_urls)),
    url(r'^api/v1/', include(v1_push_urls)),
    url(r'^api/v1/', include(v1_invite_urls)),
    # TODO(JoshNang) match other api urls.
    url('^api/v1/notifications/$', notification_list),
    url('^api/v1/notifications/(?P<pk>\d+)/$',
        notification_detail),
    url('^api/v1/presence/$', presence),
    url('^api/v1/check_in/$', 'push.views.check_in'),

    url(r'^api/v1/token/', get_token),
    url(r'^api/cookie/', get_cookie),
    url(r'^api/v1/pusher/auth$', pusher_auth),

)

if settings.DEBUG:
    import debug_toolbar
    urlpatterns += patterns(
        '',
        url(r'^__debug__/', include(debug_toolbar.urls)),
        url(r'^$', 'django.contrib.staticfiles.views.serve',
            kwargs={
                'path': 'index.html',
                # 'document_root': settings.STATIC_ROOT
            }),
        url(r'^(?P<path>.*)$',
            'django.contrib.staticfiles.views.serve', {
                # 'document_root': settings.STATIC_ROOT,
                'show_indexes': True
            }),
    )
