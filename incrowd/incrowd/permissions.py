from rest_framework import permissions


SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS']


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True
        print("OwnerPerm", obj.user == request.user)
        # Write permissions are only allowed to the owner of the snippet.
        return obj.user == request.user


class IsPrivate(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """

    def has_object_permission(self, request, view, obj):
        # No safe permissions for private non-crowd
        # Write permissions are only allowed to the owner of the snippet.
        print("Private", not (obj.crowd.private
                              and obj.crowd != request.user.crowd))

        return not (obj.crowd.private and obj.crowd != request.user.crowd)


class IsSuperUser(permissions.BasePermission):
    """
    Allows access only to admin users.
    """

    def has_permission(self, request, view):
        return (
            request.method in SAFE_METHODS or
            request.user and
            request.user.is_superuser
        )