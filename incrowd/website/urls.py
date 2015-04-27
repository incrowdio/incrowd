from rest_framework import routers
from website.api import UserViewSet, PostViewSet, CommentViewSet, \
    CategoryViewSet, CrowdViewSet

router = routers.SimpleRouter()
router.register(r'users', UserViewSet)
router.register(r'posts', PostViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'comments', CommentViewSet)
router.register(r'crowds', CrowdViewSet)
