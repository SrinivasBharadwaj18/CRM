from rest_framework.permissions import BasePermission
    
class IsOwner(BasePermission):
    def has_permission(self, request, view):
        # Check if user is logged in AND is an owner
        return bool(request.user and request.user.is_authenticated and request.user.role == "owner")