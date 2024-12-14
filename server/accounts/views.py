import pyotp
from knox.auth import TokenAuthentication
from knox.models import AuthToken
from knox.views import LoginView as KnoxLoginView
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import CustomUser
from accounts.permissions import IsRegularUser

from .serializers import UserLoginSerializer, UserRegistrationSerializer


class UserRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Default user role, can be modified by an admin
        request.data["role"] = 2
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            # Generate QR code for MFA setup
            totp = pyotp.TOTP(user.mfa_secret)
            mfa_provisioning_url = totp.provisioning_uri(
                name=user.username, issuer_name="SecureFileShare"
            )

            return Response(
                {
                    "message": "User registered successfully",
                    "mfa_setup_url": mfa_provisioning_url,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(KnoxLoginView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        request.user = user

        return super().post(request, format=None)


class UserLogoutView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        AuthToken.objects.filter(user=request.user).delete()

        return Response(
            {"detail": "Successfully logged out."}, status=status.HTTP_200_OK
        )


class LoggedInUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = {
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            "role": request.user.role.name,
        }
        return Response(user)


# TODO: Move this into a client options app
class UserListView(APIView):
    permission_classes = [IsAuthenticated, IsRegularUser]

    def get(self, request):
        q = request.GET.get("q", "")
        users = CustomUser.objects.filter(username__contains=q)[:5]
        user_list = [
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role.name,
            }
            for user in users
        ]
        return Response(user_list)
