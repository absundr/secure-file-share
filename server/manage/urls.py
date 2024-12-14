from django.urls import path

from manage.views import (
    AdminAllFilesList,
    AdminFileDelete,
    AdminFileDownload,
    AdminUserDetailView,
    AdminUserListView,
)

urlpatterns = [
    path("users/", AdminUserListView.as_view(), name="admin-user-list"),
    path("users/<int:pk>/", AdminUserDetailView.as_view(), name="admin-user-detail"),
    path("files/", AdminAllFilesList.as_view(), name="admin-all-files-list"),
    path(
        "files/download/<int:pk>/",
        AdminFileDownload.as_view(),
        name="admin-file-download",
    ),
    path(
        "files/delete/<int:pk>/",
        AdminFileDelete.as_view(),
        name="admin-file-delete",
    ),
]
