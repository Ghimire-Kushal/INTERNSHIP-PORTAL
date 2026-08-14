from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class PortalUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (("Portal", {"fields": ("role", "phone", "profile_image", "is_verified", "created_at", "updated_at")}),)
    readonly_fields = ("created_at", "updated_at")
    list_display = ("username", "email", "role", "is_verified", "is_staff", "is_active")
