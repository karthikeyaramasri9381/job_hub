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


import os
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
from profiles.models import CandidateProfile, RecruiterProfile
from .serializers import GoogleAuthSerializer


class GoogleAuthView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(
                success=False,
                message="Invalid Google authentication request.",
                data=serializer.errors,
                http_status=status.HTTP_400_BAD_REQUEST
            )

        token = serializer.validated_data['id_token']
        target_role = serializer.validated_data.get('role', User.Role.CANDIDATE)
        client_id = os.getenv('GOOGLE_CLIENT_ID', '').strip()

        try:
            # Verify Google ID Token server-side
            if client_id and client_id != 'your-google-client-id.apps.googleusercontent.com':
                id_info = google_id_token.verify_oauth2_token(
                    token,
                    google_requests.Request(),
                    client_id
                )
            else:
                id_info = google_id_token.verify_oauth2_token(
                    token,
                    google_requests.Request()
                )

            email = id_info.get('email')
            if not email:
                return api_response(
                    success=False,
                    message="Google ID token does not contain a valid email address.",
                    http_status=status.HTTP_400_BAD_REQUEST
                )

            first_name = id_info.get('given_name', '')
            last_name = id_info.get('family_name', '')

        except ValueError as e:
            return api_response(
                success=False,
                message=f"Google ID token verification failed: {str(e)}",
                http_status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return api_response(
                success=False,
                message="Google authentication service error.",
                data={"error": str(e)},
                http_status=status.HTTP_400_BAD_REQUEST
            )

        # Retrieve or create user securely
        email = email.lower()
        user = User.objects.filter(email__iexact=email).first()

        created = False
        if not user:
            user = User.objects.create_user(
                email=email,
                password=None,
                first_name=first_name,
                last_name=last_name,
                role=target_role,
                google_account=True
            )
            created = True

            if user.role == User.Role.CANDIDATE:
                full_name = f"{first_name} {last_name}".strip() or email.split('@')[0]
                CandidateProfile.objects.get_or_create(user=user, defaults={'full_name': full_name})
            elif user.role == User.Role.RECRUITER:
                RecruiterProfile.objects.get_or_create(user=user)
        else:
            if not user.google_account:
                user.google_account = True
                user.save(update_fields=['google_account'])

        refresh = RefreshToken.for_user(user)

        return api_response(
            success=True,
            message="Google authentication successful.",
            data={
                "user": UserSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "is_new_user": created
            },
            http_status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )
