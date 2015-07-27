from rest_framework import viewsets

from incrowd.filters import CrowdFilter
from incrowd.permissions import IsOwnerOrReadOnly, IsPrivate, IsUserInCrowd


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

    def get_serializer_class(self):
        # if self.request.method == 'POST':
        #     return UserCreateSerializer

        return super(InCrowdModelViewSet, self).get_serializer_class()
