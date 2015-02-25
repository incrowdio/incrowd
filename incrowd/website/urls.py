from rest_framework import routers
from website.api import UserViewSet, PostViewSet, CommentViewSet, \
    CategoryViewSet

router = routers.SimpleRouter()
router.register(r'users', UserViewSet)
router.register(r'posts', PostViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'comments', CommentViewSet)
