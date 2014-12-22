import logging
from django.db.models import Count
from rest_framework import renderers

from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes, \
    authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import filters

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


class UserList(generics.ListAPIView):
    model = UserProfile
    serializer_class = UserSerializer
    paginate_by = 25
    paginate_by_param = 'page_size'
    max_paginate_by = 100

    def get_queryset(self):
        return UserProfile.objects.prefetch_related('user_votes').order_by(
            '-last_updated')


class UserDetail(generics.RetrieveUpdateAPIView):
    lookup_field = 'username'
    model = UserProfile
    serializer_class = UserSerializer


class PostList(generics.ListCreateAPIView):
    model = Post
    serializer_class = PostSerializer
    filter_backends = (filters.DjangoFilterBackend, filters.SearchFilter,
                       filters.OrderingFilter)
    ordering = ('-submitted',)
    ordering_fields = ('submitted',)

    filter_fields = ('category', 'user', 'user__username', 'submitted')
    paginate_by = 10
    paginate_by_param = 'page_size'
    max_paginate_by = 100
    queryset = Post.objects.select_related(
        'user').prefetch_related('user__user_votes').prefetch_related(
        'user__user_votes__user').prefetch_related(
        'category').prefetch_related('comment_set')

    # def get_queryset(self):
    # return

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


class PostDetail(generics.RetrieveUpdateDestroyAPIView):
    model = Post
    serializer_class = PostDetailSerializer

    queryset = Post.objects.select_related(
        'user').prefetch_related('user__user_votes').prefetch_related(
        'user__user_votes__user').prefetch_related('comment_set')


class UserPostList(generics.ListAPIView):
    model = Post
    serializer_class = PostSerializer
    paginate_by = 10
    paginate_by_param = 'page_size'
    max_paginate_by = 100

    def get_queryset(self):
        queryset = super(UserPostList, self).get_queryset()
        return queryset.filter(author__username=self.kwargs.get('username'))


class CommentList(generics.ListCreateAPIView):
    model = Comment
    serializer_class = CommentSerializer


class CommentDetail(generics.RetrieveUpdateDestroyAPIView):
    model = Comment
    serializer_class = CommentSerializer
    paginate_by = 100
    paginate_by_param = 'page_size'
    max_paginate_by = 1000


class PostCommentList(generics.ListCreateAPIView):
    model = Comment
    serializer_class = CommentSerializer
    paginate_by = 100
    paginate_by_param = 'page_size'
    max_paginate_by = 1000

    def pre_save(self, obj):
        obj.user = self.request.user

    def get_queryset(self):
        queryset = super(PostCommentList, self).get_queryset()
        return queryset.filter(post__pk=self.kwargs.get('pk'))


class CategoryList(generics.ListCreateAPIView):
    model = Category
    serializer_class = CategorySerializer
    filter_backends = (filters.SearchFilter,)
    search_fields = ('name',)


class CategoryTopAPI(generics.GenericAPIView):
    queryset = Category.objects.all()
    renderer_classes = (renderers.JSONRenderer,)

    def get(self, request, *args, **kwargs):
        top_cats = Category.objects.all().annotate(
            post_count=Count('post__id')).order_by('-post_count')
        logger.info('top cats {}'.format(top_cats))
        return Response(
            CategoryTopSerializer(top_cats[0:5], many=True).data)


class CategoryDetail(generics.RetrieveUpdateDestroyAPIView):
    model = Category
    serializer_class = CategorySerializer
