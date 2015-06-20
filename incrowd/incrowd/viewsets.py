from incrowd.filters import CrowdFilter
from incrowd.permissions import IsOwnerOrReadOnly, IsPrivate, IsUserInCrowd

from rest_framework import viewsets


class InCrowdModelViewSet(viewsets.ModelViewSet):
    """A viewset that automatically filters and applies inCrowd permissions"""
    # pass
    incrowd_filter_backends = (
        CrowdFilter,
    )
    incrowd_permissions = (
        IsUserInCrowd,
        IsOwnerOrReadOnly,
        IsPrivate,
    )

    def get_filter_backends(self):
        return list(self.filter_backends) + list(self.incrowd_filter_backends)

    def get_permissions(self):
        return [permission() for permission in
                list(self.permission_classes) + list(self.incrowd_permissions)]
