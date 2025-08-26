from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsOwnerOrAdmin(BasePermission):
    """
    Regular users: can only operate on their own objects.
    Admins (is_staff or is_superuser): can operate on all objects.
    """
    def has_object_permission(self, request, view, obj):
        if request.user and (request.user.is_staff or request.user.is_superuser):
            return True
        return getattr(obj, "user_id", None) == getattr(request.user, "id", None)

    def has_permission(self, request, view):
        # List/create and other non-object-level permissions: login is sufficient
        return bool(request.user and request.user.is_authenticated)
