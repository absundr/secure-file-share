from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role.name == "admin"


class IsRegularUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role.name in ["admin", "user"]


class IsGuestUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role.name in ["admin", "user", "guest"]
