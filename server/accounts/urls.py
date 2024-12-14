from django.urls import path

from .views import (
    LoggedInUserView,
    UserListView,
    UserLoginView,
    UserLogoutView,
    UserRegistrationView,
)

urlpatterns = [
    path("register/", UserRegistrationView.as_view(), name="user-register"),
    path("login/", UserLoginView.as_view(), name="user-login"),
    path("logout/", UserLogoutView.as_view(), name="user-logout"),
    path("users/", UserListView.as_view(), name="user-list"),
    path("current-user/", LoggedInUserView.as_view(), name="current-user"),
]
