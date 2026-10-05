from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import User
from .serializers import UserSerializer
from companies.models import Company
from jobs.models import Job
from jobs.serializers import JobSerializer
from applications.models import Application
from common.permissions import IsAdminRole
from common.utils import api_response


class AdminStatsAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def get(self, request):
        stats = {
            "total_users": User.objects.count(),
            "candidates": User.objects.filter(role=User.Role.CANDIDATE).count(),
            "recruiters": User.objects.filter(role=User.Role.RECRUITER).count(),
            "companies": Company.objects.count(),
            "jobs": Job.objects.count(),
            "published_jobs": Job.objects.filter(status=Job.Status.PUBLISHED).count(),
            "applications": Application.objects.count(),
        }
        return api_response(
            success=True,
            message="Platform statistics retrieved successfully.",
            data=stats
        )


class AdminUsersListAPIView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]
    serializer_class = UserSerializer

    def get_queryset(self):
        queryset = User.objects.all().order_by('-created_at')
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role__iexact=role)
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return api_response(
            success=True,
            message="Users list retrieved successfully.",
            data=serializer.data
        )


class AdminUserToggleActiveAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return api_response(
                success=False,
                message="User not found.",
                http_status=status.HTTP_404_NOT_FOUND
            )

        if user.is_superuser:
            return api_response(
                success=False,
                message="Superuser accounts cannot be disabled.",
                http_status=status.HTTP_400_BAD_REQUEST
            )

        user.is_active = not user.is_active
        user.save(update_fields=['is_active', 'updated_at'])

        return api_response(
            success=True,
            message=f"User status updated to {'Active' if user.is_active else 'Disabled'}.",
            data=UserSerializer(user).data
        )


class AdminJobsListAPIView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]
    serializer_class = JobSerializer

    def get_queryset(self):
        return Job.objects.all().select_related('company', 'created_by').order_by('-created_at')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return api_response(
            success=True,
            message="All platform jobs retrieved.",
            data=serializer.data
        )


class AdminJobDeleteAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def delete(self, request, pk):
        try:
            job = Job.objects.get(pk=pk)
            job.delete()
            return api_response(
                success=True,
                message="Inappropriate job posting deleted by admin."
            )
        except Job.DoesNotExist:
            return api_response(
                success=False,
                message="Job not found.",
                http_status=status.HTTP_404_NOT_FOUND
            )
