from io import BytesIO

from django.contrib.auth import get_user_model
from django.http import FileResponse
from rest_framework import generics, status
from rest_framework.response import Response

from accounts.permissions import IsAdminUser
from files.models import EncryptedFile, FileShare
from files.serializers import FileDecryptSerializer

from .serializers import (
    AdminEncryptedFileSerializer,
    AdminUserSerializer,
    AdminUserUpdateSerializer,
)

User = get_user_model()


class AdminUserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]


class AdminUserDetailView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return AdminUserUpdateSerializer
        return AdminUserSerializer


class AdminAllFilesList(generics.ListAPIView):
    queryset = EncryptedFile.objects.all()
    serializer_class = AdminEncryptedFileSerializer
    permission_classes = [IsAdminUser]


class AdminFileDownload(generics.RetrieveAPIView):
    queryset = EncryptedFile.objects.all()
    serializer_class = AdminEncryptedFileSerializer
    permission_classes = [IsAdminUser]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        request.user = instance.user
        serializer = FileDecryptSerializer(
            data={"file_id": instance.id}, context={"request": request}
        )

        if serializer.is_valid():
            decrypted_data = serializer.save()

            # Determine the mime type (if possible)
            import mimetypes

            # Get the original filename
            original_filename = serializer.filename

            # Guess the mime type based on the filename
            mime_type, _ = mimetypes.guess_type(original_filename)

            # Fallback to generic binary type if mime type can't be determined
            if not mime_type:
                mime_type = "application/octet-stream"

            response = FileResponse(
                BytesIO(decrypted_data["file_content"]),
                as_attachment=True,  # This ensures it's downloaded
                filename=original_filename,
                content_type=mime_type,
            )

            # Additional headers to ensure proper download
            response["Content-Disposition"] = (
                f'attachment; filename="{original_filename}"'
            )
            response["Access-Control-Expose-Headers"] = "Content-Disposition"

            return response

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminFileDelete(generics.DestroyAPIView):
    queryset = EncryptedFile.objects.all()
    serializer_class = AdminEncryptedFileSerializer
    permission_classes = [IsAdminUser]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        FileShare.objects.filter(file=instance.id).all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
