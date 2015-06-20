from rest_framework.filters import BaseFilterBackend


class CrowdFilter(BaseFilterBackend):
    """
    Only return results in crowds the user is in.

    TODO(pcsforeducation) support multiple crowds
    """

    def filter_queryset(self, request, queryset, view):
        crowd = request.user.crowd

        return queryset.filter(crowd=crowd)
