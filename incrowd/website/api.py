from __future__ import unicode_literals
import logging

from django.db.models import Count
from rest_framework import renderers
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes, \
    authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import filters, viewsets

from invite_only.models import InviteCode
from website.models import UserProfile, Post, Comment, Category, \
    UserSerializer, PostSerializer, PostDetailSerializer, CommentSerializer, \
    CategorySerializer, CategoryTopSerializer


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


class UserViewSet(viewsets.ModelViewSet):
    lookup_field = 'username'
    serializer_class = UserSerializer
    queryset = UserProfile.objects.prefetch_related('user_votes').order_by(
        '-last_updated')

    paginate_by = 25
    paginate_by_param = 'page_size'
    max_paginate_by = 100


class PostViewSet(viewsets.ModelViewSet):
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

    def create(self, request, *args, **kwargs):
        # TODO(pcsforeducation) this is a mess
        data = dict(request.DATA)

        # Get the category
        category_pk = int(data['category'][0])
        try:
            data['category'] = Category.objects.get(id=category_pk)
        except Category.DoesNotExist:
            return Response({'error': 'category does not exist'},
                            status=status.HTTP_400_BAD_REQUEST)
        data['title'] = data['title'][0]
        if data.get('url'):
            data['url'] = data['url'][0]
        data['user'] = request.user
        try:
            self.object = Post(**data)
            self.pre_save(self.object)
            self.object.save()
        except Exception:
            logger.exception('invalid form')
            return Response({'errors': 'Invalid form'},
                            status=status.HTTP_400_BAD_REQUEST)
        self.post_save(self.object, created=True)
        serializer = self.get_serializer(instance=self.object)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED,
                        headers=headers)


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    queryset = Comment.objects.all()

    paginate_by = 100
    paginate_by_param = 'page_size'
    max_paginate_by = 1000

    filter_backends = (filters.DjangoFilterBackend, filters.SearchFilter,
                       filters.OrderingFilter)

    filter_fields = ('user', 'user__username', 'submitted', 'post__id')
    ordering = ('-submitted',)
    ordering_fields = ('submitted',)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CategorySerializer
    queryset = Category.objects.all().annotate(
        post_count=Count('post__id')).order_by('-post_count')

    ordering = ('-post_count',)
    ordering_fields = ('post_count',)
