from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models


class Role(models.Model):
    ROLE_CHOICES = (
        ("admin", "Administrator"),
        ("user", "Regular User"),
        ("guest", "Guest User"),
    )
    name = models.CharField(max_length=50, choices=ROLE_CHOICES, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class CustomUser(AbstractUser):
    role = models.ForeignKey(
        Role, on_delete=models.SET_NULL, null=True, related_name="users"
    )
    mfa_secret = models.CharField(max_length=32, blank=True, null=True)

    groups = models.ManyToManyField(
        Group,
        verbose_name="groups",
        blank=True,
        help_text="The groups this user belongs to.",
        related_name="custom_users",
    )

    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name="user permissions",
        blank=True,
        help_text="Specific permissions for this user.",
        related_name="custom_users",
    )

    def __str__(self):
        return self.username
