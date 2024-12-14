from django.urls import path

from .views import (
    DeleteFileView,
    FileDecryptView,
    FileListView,
    FileShareView,
    FileUploadView,
    RevokeFileListView,
    RevokeFileShareView,
    SharedFileListView,
)

urlpatterns = [
    path("", FileListView.as_view(), name="files"),
    path("upload", FileUploadView.as_view(), name="files-upload"),
    path("download/<int:file_id>", FileDecryptView.as_view(), name="files-download"),
    path("share", FileShareView.as_view(), name="file-share"),
    path("shared", SharedFileListView.as_view(), name="shared-files"),
    path("revoke", RevokeFileListView.as_view(), name="revoke-files"),
    path("share/revoke", RevokeFileShareView.as_view(), name="revoke-share"),
    path("delete/<int:file_id>", DeleteFileView.as_view(), name="delete-file"),
]
