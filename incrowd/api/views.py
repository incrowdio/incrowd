from __future__ import unicode_literals
import logging

from rest_framework.authentication import BasicAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, authentication_classes, \
    permission_classes
from rest_framework.permissions import AllowAny

from website.models import UserProfile
from website.utils import render_to_json


logger = logging.getLogger(__name__)


@api_view(['GET'])
@authentication_classes((BasicAuthentication,))
@permission_classes((AllowAny, ))
def get_token(request):
    user = UserProfile.objects.get(id=request.user.id)
    token = Token.objects.get_or_create(user=user)
    return render_to_json(request, {
        'id': request.user.id,
        'username': request.user.username,
        'token': token[0].key
    })


def get_cookie(request):
    # A way for Angular to get the CSRF cookie
    return render_to_json(request, {'user_id': request.user.id})

