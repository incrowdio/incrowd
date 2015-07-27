from __future__ import unicode_literals

from rest_framework import viewsets

from invite_only.models import InviteCode, InviteCodeSerializer


class InviteCodeViewSet(viewsets.ModelViewSet):
    serializer_class = InviteCodeSerializer
    queryset = InviteCode.objects.all()

    def perform_create(self, serializer):
        serializer.save(invited_by=self.request.user,
                        crowd=self.request.user.crowd)
