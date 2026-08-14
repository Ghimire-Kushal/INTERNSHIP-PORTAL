from rest_framework.permissions import BasePermission


class IsStudent(BasePermission):
    message = "This action is available to student accounts only."
    def has_permission(self, request, view): return bool(request.user.is_authenticated and request.user.role == "student")
