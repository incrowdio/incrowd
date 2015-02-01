from __future__ import unicode_literals

from rest_framework import generics

from invite_only.models import InviteCode
from invite_only.serializers import InviteCodeSerializer


class InviteCodeView(generics.ListCreateAPIView):
    model = InviteCode
    serializer_class = InviteCodeSerializer

    def pre_save(self, obj):
        obj.invited_by = self.request.user


class InviteCodeDetail(generics.RetrieveAPIView):
    model = InviteCode
    serializer_class = InviteCodeSerializer
    lookup_field = 'code'
