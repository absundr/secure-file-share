import pyotp
from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Role

User = get_user_model()


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ["id", "name", "description"]


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    role = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all())
    mfa_token = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "role", "mfa_token"]

    def create(self, validated_data):
        # Generate MFA secret
        mfa_secret = pyotp.random_base32()

        # Create user
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
            role=validated_data["role"],
        )

        # Set MFA secret
        user.mfa_secret = mfa_secret
        user.save()

        return user


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    mfa_code = serializers.CharField()

    def validate(self, data):
        username = data.get("username")
        password = data.get("password")
        mfa_code = data.get("mfa_code")

        user = User.objects.filter(username=username).first()
        if not user:
            raise serializers.ValidationError("User not found")

        if not user.check_password(password):
            raise serializers.ValidationError("Invalid credentials")

        # Validate MFA
        totp = pyotp.TOTP(user.mfa_secret)
        if not totp.verify(mfa_code):
            raise serializers.ValidationError("Invalid MFA code")

        data["user"] = user
        return data
