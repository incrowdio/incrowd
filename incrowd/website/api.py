from __future__ import unicode_literals
import logging

from django.db.models import Count
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, \
    authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import filters, viewsets

from incrowd.permissions import IsOwnerOrReadOnly, IsPrivate, IsSuperUser
from incrowd.viewsets import InCrowdModelViewSet
from invite_only.models import InviteCode
from website.models import UserProfile, Post, Comment, Category, \
    UserSerializer, PostSerializer, CommentSerializer, \
    CategorySerializer, Crowd, CrowdSerializer, UserCreateSerializer


logger = logging.getLogger(__name__)


@api_view(['POST'])
@authentication_classes(())
@permission_classes((AllowAny, ))
def register(request, *args, **kwargs):
    serialized = UserSerializer(data=request.DATA)
    # Check that invite code is correct
    try:
        invite = InviteCode.objects.get(code=serialized.init_data['code'])
    except:
        return Response("Invalid code", status=status.HTTP_403_FORBIDDEN)
    if serialized.is_valid():
        UserProfile.objects.create_user(
            serialized.init_data['username'],
            serialized.init_data['email'],
            serialized.init_data['password']
        )
        invite.delete()
        return Response(serialized.data, status=status.HTTP_201_CREATED)
    else:
        return Response(serialized._errors,
                        status=status.HTTP_400_BAD_REQUEST)


class UserViewSet(InCrowdModelViewSet):
    lookup_field = 'username'
    serializer_class = UserSerializer
    queryset = UserProfile.objects.prefetch_related('user_votes').order_by(
        '-last_updated')

    paginate_by = 25
    paginate_by_param = 'page_size'
    max_paginate_by = 100

    permission_classes = (IsOwnerOrReadOnly,
                          IsPrivate)
    filter_backends = (filters.DjangoFilterBackend, filters.SearchFilter,
                       filters.OrderingFilter)

    def get_serializer_class(self):
        print "Getting User serializer", self.request.method
        if self.request.method == 'POST':
            return UserCreateSerializer

        s = super(UserViewSet, self).get_serializer_class()
        print 'class is ', s
        return s


class PostViewSet(InCrowdModelViewSet):
    serializer_class = PostSerializer
    queryset = Post.objects.select_related(
        'user').prefetch_related('user__user_votes').prefetch_related(
        'user__user_votes__user').prefetch_related(
        'category').prefetch_related('comment_set')

    paginate_by = 10
    paginate_by_param = 'page_size'
    max_paginate_by = 100

    filter_backends = (filters.DjangoFilterBackend, filters.SearchFilter,
                       filters.OrderingFilter)

    filter_fields = ('category', 'user', 'user__username', 'submitted')
    ordering = ('-submitted',)
    ordering_fields = ('submitted',)

    def perform_create(self, serializer):
        category = Category.objects.get(id=serializer.initial_data.get(
            'category'))
        serializer.save(user=self.request.user,
                        crowd=self.request.user.crowd,
                        category=category)

    def pre_save(self, obj):
        obj.user = self.request.user


class CommentViewSet(InCrowdModelViewSet):
    serializer_class = CommentSerializer
    queryset = Comment.objects.all()

    paginate_by = 100
    paginate_by_param = 'page_size'
    # max_paginate_by = 1000

    filter_backends = (filters.DjangoFilterBackend, filters.SearchFilter,
                       filters.OrderingFilter)

    filter_fields = ('user', 'user__username', 'submitted', 'post__id')
    ordering = ('-submitted',)
    ordering_fields = ('submitted',)

    def perform_create(self, serializer):
        print 'CREATE', serializer.initial_data
        serializer.save(user=self.request.user,
                        crowd=self.request.user.crowd)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CategorySerializer
    queryset = Category.objects.all().annotate(
        post_count=Count('post__id')).order_by('-post_count')

    ordering = ('-post_count',)
    ordering_fields = ('post_count',)


class CrowdViewSet(InCrowdModelViewSet):
    serializer_class = CrowdSerializer
    queryset = Crowd.objects.all()

    permission_classes = (IsSuperUser,)
