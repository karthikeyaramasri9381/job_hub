from rest_framework import status, permissions, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    CustomTokenObtainPairSerializer,
    LogoutSerializer
)
from common.utils import api_response


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return api_response(
                success=False,
                message="Registration failed due to validation errors.",
                data=serializer.errors,
                http_status=status.HTTP_400_BAD_REQUEST
            )
        
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        
        return api_response(
            success=True,
            message="User registered successfully.",
            data={
                "user": UserSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            http_status=status.HTTP_201_CREATED
        )


class CustomTokenObtainPairView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return api_response(
                success=False,
                message="Invalid email or password.",
                data=serializer.errors,
                http_status=status.HTTP_401_UNAUTHORIZED
            )

        data = serializer.validated_data
        return api_response(
            success=True,
            message="Login successful.",
            data=data,
            http_status=status.HTTP_200_OK
        )


class CustomTokenRefreshView(TokenRefreshView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            return api_response(
                success=True,
                message="Token refreshed successfully.",
                data=response.data,
                http_status=status.HTTP_200_OK
            )
        return api_response(
            success=False,
            message="Invalid or expired refresh token.",
            data=response.data,
            http_status=response.status_code
        )


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        if serializer.is_valid():
            try:
                token = RefreshToken(serializer.validated_data['refresh'])
                token.blacklist()
            except Exception:
                pass  # Token already blacklisted or invalid
            return api_response(
                success=True,
                message="Logout successful.",
                http_status=status.HTTP_200_OK
            )
        return api_response(
            success=False,
            message="Refresh token is required for logout.",
            data=serializer.errors,
            http_status=status.HTTP_400_BAD_REQUEST
        )


class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return api_response(
            success=True,
            message="User profile retrieved successfully.",
            data=serializer.data,
            http_status=status.HTTP_200_OK
        )
