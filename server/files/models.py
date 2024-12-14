from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class EncryptedFile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    filename = models.CharField(max_length=255)
    encrypted_content = models.BinaryField()
    encrypted_file_key = models.BinaryField()  # Now stores the authentication tag
    nonce = models.BinaryField()
    salt = models.BinaryField()  # Store salt for key derivation
    created_at = models.DateTimeField(auto_now_add=True)


class FileShare(models.Model):
    """
    Model to track file sharing between users
    """

    file = models.ForeignKey(
        EncryptedFile, on_delete=models.CASCADE, related_name="shares"
    )
    shared_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="shared_files"
    )
    shared_with = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_shared_files",
    )
    shared_at = models.DateTimeField(auto_now_add=True)
    is_revoked = models.BooleanField(default=False)

    class Meta:
        unique_together = ("file", "shared_with")  # Prevent duplicate shares
        verbose_name_plural = "File Shares"

    def __str__(self):
        return f"{self.file.filename} shared by {self.shared_by.username} with {self.shared_with.username}"
