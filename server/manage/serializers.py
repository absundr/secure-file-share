from django.contrib.auth import get_user_model
from rest_framework import serializers

from accounts.models import Role
from accounts.serializers import RoleSerializer
from files.models import EncryptedFile

User = get_user_model()


class AdminUserSerializer(serializers.ModelSerializer):
    role = RoleSerializer()

    class Meta:
        model = User
        fields = ["id", "username", "email", "role"]


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["role"]

    role = serializers.SlugRelatedField(
        slug_field="name", queryset=Role.objects.all(), required=True
    )

    def update(self, instance, validated_data):
        role_data = validated_data.pop("role")
        role = Role.objects.get(name=role_data)
        instance.role = role
        instance.save()
        return instance


class AdminOwnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username"]


class AdminEncryptedFileSerializer(serializers.ModelSerializer):
    owner = AdminOwnerSerializer(source="user", read_only=True)

    class Meta:
        model = EncryptedFile
        fields = ["id", "filename", "owner", "created_at"]
        read_only_fields = ["owner", "created_at"]
