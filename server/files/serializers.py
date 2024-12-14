import base64
import os
import secrets
from io import BytesIO

from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import serializers

from .models import EncryptedFile, FileShare


class FileEncryptionMixin:
    @classmethod
    def _get_master_key(cls):
        master_key = os.environ.get("FILE_ENCRYPTION_MASTER_KEY")
        if not master_key:
            raise ValueError("Master encryption key not configured")
        return base64.b64decode(master_key)

    @classmethod
    def _derive_key(cls, salt):
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
            backend=default_backend(),
        )
        return kdf.derive(cls._get_master_key())


class FileUploadSerializer(serializers.Serializer, FileEncryptionMixin):
    file = serializers.FileField()
    filename = serializers.CharField(read_only=True)
    file_id = serializers.IntegerField(read_only=True)

    def validate_file(self, file):
        max_size = 50 * 1024 * 1024  # 50 MB
        if file.size > max_size:
            raise serializers.ValidationError(
                f"File size must be under {max_size/1024/1024} MB"
            )

        return file

    def create(self, validated_data):
        user = self.context["request"].user
        file = validated_data["file"]

        # Generate random salt and nonce
        salt = secrets.token_bytes(16)
        nonce = secrets.token_bytes(16)

        # Derive encryption key
        derived_key = self._derive_key(salt)

        # Prepare cipher with GCM mode
        cipher = Cipher(
            algorithms.AES(derived_key), modes.GCM(nonce), backend=default_backend()
        )

        # Create encryptor
        encryptor = cipher.encryptor()

        # Read file content
        file_content = file.read()

        # Encrypt content
        ciphertext = encryptor.update(file_content) + encryptor.finalize()

        # Get authentication tag
        tag = encryptor.tag

        # Create encrypted file record
        encrypted_file = EncryptedFile.objects.create(
            user=user,
            filename=file.name,
            encrypted_content=ciphertext,
            encrypted_file_key=tag,  # Store tag separately
            nonce=nonce,
            salt=salt,  # Store salt for key derivation
        )

        # Set serializer fields
        self.filename = file.name
        self.file_id = encrypted_file.id

        return encrypted_file


class FileDecryptSerializer(serializers.Serializer, FileEncryptionMixin):
    file_id = serializers.IntegerField()
    filename = serializers.CharField(read_only=True)
    file_content = serializers.FileField(read_only=True)

    def validate_file_id(self, file_id):
        # Validate file ownership and existence
        user = self.context["request"].user
        try:
            # Check if file belongs to user or has been shared with user
            encrypted_file = EncryptedFile.objects.filter(
                Q(id=file_id, user=user)
                | Q(id=file_id, shares__shared_with=user, shares__is_revoked=False)
            ).first()

            if not encrypted_file:
                raise serializers.ValidationError("File not found or access denied")

            return encrypted_file
        except EncryptedFile.DoesNotExist:
            raise serializers.ValidationError("File not found or access denied")

    def create(self, validated_data):
        encrypted_file = validated_data["file_id"]

        try:
            # Derive key using stored salt
            derived_key = self._derive_key(encrypted_file.salt)

            # Prepare cipher with GCM mode
            cipher = Cipher(
                algorithms.AES(derived_key),
                modes.GCM(encrypted_file.nonce, encrypted_file.encrypted_file_key),
                backend=default_backend(),
            )

            # Create decryptor
            decryptor = cipher.decryptor()

            # Decrypt content
            decrypted_content = (
                decryptor.update(encrypted_file.encrypted_content)
                + decryptor.finalize()
            )

            # Create a BytesIO object instead of ContentFile
            decrypted_file = BytesIO(decrypted_content)

            # Set serializer fields
            self.filename = encrypted_file.filename
            self.file_content = decrypted_file

            return {"file_content": decrypted_content}  # Return raw bytes

        except Exception as e:
            raise serializers.ValidationError(f"Decryption failed: {str(e)}")


class FileShareSerializer(serializers.Serializer):
    file_id = serializers.IntegerField()
    shared_with_username = serializers.CharField()

    def validate_file_id(self, file_id):
        """
        Validate that the file exists and belongs to the current user
        """
        user = self.context["request"].user
        try:
            file = EncryptedFile.objects.get(id=file_id, user=user)
            return file
        except EncryptedFile.DoesNotExist:
            raise serializers.ValidationError(
                "File not found or you don't have permission to share this file."
            )

    def validate_shared_with_username(self, username):
        """
        Validate that the user to share with exists
        """
        User = get_user_model()
        try:
            user = User.objects.get(username=username)
            return user
        except User.DoesNotExist:
            raise serializers.ValidationError("User to share with not found.")

    def validate(self, data):
        """
        Additional validation to prevent sharing with self
        """
        if data["file_id"].user == data["shared_with_username"]:
            raise serializers.ValidationError("You cannot share a file with yourself.")
        return data

    def create(self, validated_data):
        """
        Create a file share entry
        """
        file = validated_data["file_id"]
        shared_with = validated_data["shared_with_username"]

        file_share = FileShare.objects.filter(
            file=file, shared_with=shared_with
        ).first()

        if file_share:
            file_share.is_revoked = False
            file_share.save()
        else:
            # Create file share entry
            file_share = FileShare.objects.create(
                file=file,
                shared_by=self.context["request"].user,
                shared_with=shared_with,
            )
        return file_share
