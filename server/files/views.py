from io import BytesIO

from django.contrib.auth import get_user_model
from django.http import FileResponse
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsRegularUser
from files.models import EncryptedFile, FileShare
from files.serializers import (
    FileDecryptSerializer,
    FileShareSerializer,
    FileUploadSerializer,
)


class FileUploadView(APIView):
    permission_classes = [IsAuthenticated, IsRegularUser]

    def post(self, request):
        print(request.data)
        serializer = FileUploadSerializer(
            data=request.data, context={"request": request}
        )

        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "file_id": serializer.file_id,
                    "filename": serializer.filename,
                    "message": "File encrypted and stored successfully",
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FileDecryptView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, file_id):
        serializer = FileDecryptSerializer(
            data={"file_id": file_id}, context={"request": request}
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


class FileShareView(APIView):
    permission_classes = [IsAuthenticated, IsRegularUser]

    def post(self, request):
        """
        Endpoint to share a file with another user
        """
        serializer = FileShareSerializer(
            data=request.data, context={"request": request}
        )

        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "message": "File shared successfully",
                    "shared_with": serializer.validated_data[
                        "shared_with_username"
                    ].username,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SharedFileListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        List all files shared with the current user
        """
        shared_files = FileShare.objects.filter(
            shared_with=request.user, is_revoked=False
        ).select_related("file", "shared_by")

        shared_file_data = [
            {
                "id": share.file.id,
                "filename": share.file.filename,
                "shared_by": share.shared_by.username,
                "shared_at": share.shared_at,
            }
            for share in shared_files
        ]

        return Response(shared_file_data)


class RevokeFileListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        List all files shared by the current user
        """
        shared_files = FileShare.objects.filter(
            shared_by=request.user, is_revoked=False
        ).select_related("file", "shared_by")

        shared_file_data = [
            {
                "id": share.file.id,
                "filename": share.file.filename,
                "shared_by": share.shared_by.username,
                "shared_with": share.shared_with.username,
                "shared_at": share.shared_at,
            }
            for share in shared_files
        ]

        return Response(shared_file_data)


class RevokeFileShareView(APIView):
    permission_classes = [IsAuthenticated, IsRegularUser]

    def post(self, request):
        """
        Revoke a specific file share
        """
        file_id = request.data.get("file_id")
        shared_with_username = request.data.get("shared_with_username")

        if not file_id or not shared_with_username:
            return Response(
                {"error": "file_id and shared_with_username are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            User = get_user_model()
            shared_with_user = User.objects.get(username=shared_with_username)

            file_share = FileShare.objects.get(
                file_id=file_id, shared_by=request.user, shared_with=shared_with_user
            )

            file_share.is_revoked = True
            file_share.save()

            return Response(
                {"message": "File share revoked successfully"},
                status=status.HTTP_200_OK,
            )

        except (User.DoesNotExist, FileShare.DoesNotExist):
            return Response(
                {"error": "Share not found"}, status=status.HTTP_404_NOT_FOUND
            )


class FileListView(APIView):
    permission_classes = [IsAuthenticated, IsRegularUser]

    def get(self, request):
        """
        List all files uploaded by the current user
        """
        User = get_user_model()
        user = User.objects.get(username=request.user)
        files = EncryptedFile.objects.filter(user=user).select_related("user")

        file_data = [
            {
                "id": file.id,
                "filename": file.filename,
                "username": file.user.username,
            }
            for file in files
        ]

        return Response(file_data)


class DeleteFileView(APIView):
    permission_classes = [IsAuthenticated, IsRegularUser]

    def delete(self, request, file_id):
        """
        Delete a file and all shared instances
        """

        try:
            User = get_user_model()
            user = User.objects.get(username=request.user)
            EncryptedFile.objects.get(id=file_id, user=user).delete()
            FileShare.objects.filter(file=file_id, shared_by=user).all().delete()
            return Response(
                {"message": "File deleted successfully"},
                status=status.HTTP_200_OK,
            )

        except (User.DoesNotExist, EncryptedFile.DoesNotExist):
            return Response(
                {"error": "File not found"}, status=status.HTTP_404_NOT_FOUND
            )
