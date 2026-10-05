from django.db import IntegrityError
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Application
from jobs.models import Job
from profiles.models import CandidateProfile
from .serializers import ApplicationSerializer, ApplyJobSerializer, ApplicationStatusUpdateSerializer
from common.permissions import IsCandidate, IsRecruiter, IsCandidateOwner, IsRecruiterJobOwner
from common.utils import api_response


class ApplyJobAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsCandidate]

    def post(self, request, job_id):
        try:
            job = Job.objects.get(pk=job_id, status=Job.Status.PUBLISHED)
        except Job.DoesNotExist:
            return api_response(
                success=False,
                message="Job not found or no longer accepting applications.",
                http_status=status.HTTP_404_NOT_FOUND
            )

        candidate_profile, _ = CandidateProfile.objects.get_or_create(user=request.user)

        # Check existing application
        if Application.objects.filter(candidate=candidate_profile, job=job).exists():
            return api_response(
                success=False,
                message="You have already applied for this job.",
                http_status=status.HTTP_409_CONFLICT
            )

        serializer = ApplyJobSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(
                success=False,
                message="Invalid application data.",
                data=serializer.errors,
                http_status=status.HTTP_400_BAD_REQUEST
            )

        resume_url = serializer.validated_data.get('resume') or candidate_profile.resume

        try:
            application = Application.objects.create(
                candidate=candidate_profile,
                job=job,
                resume=resume_url,
                cover_letter=serializer.validated_data.get('cover_letter', ''),
                status=Application.Status.APPLIED
            )
        except IntegrityError:
            return api_response(
                success=False,
                message="You have already applied for this job.",
                http_status=status.HTTP_409_CONFLICT
            )

        return api_response(
            success=True,
            message="Application submitted successfully.",
            data=ApplicationSerializer(application).data,
            http_status=status.HTTP_201_CREATED
        )


class CandidateApplicationListAPIView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsCandidate]
    serializer_class = ApplicationSerializer

    def get_queryset(self):
        return Application.objects.filter(candidate__user=self.request.user).select_related('job', 'job__company', 'candidate').order_by('-applied_at')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return api_response(
            success=True,
            message="Submitted applications retrieved successfully.",
            data=serializer.data
        )


class CandidateApplicationWithdrawAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsCandidate, IsCandidateOwner]

    def post(self, request, pk):
        try:
            application = Application.objects.get(pk=pk, candidate__user=request.user)
        except Application.DoesNotExist:
            return api_response(
                success=False,
                message="Application not found.",
                http_status=status.HTTP_404_NOT_FOUND
            )

        if application.status in [Application.Status.SELECTED, Application.Status.REJECTED, Application.Status.WITHDRAWN]:
            return api_response(
                success=False,
                message=f"Cannot withdraw an application that is already {application.status}.",
                http_status=status.HTTP_400_BAD_REQUEST
            )

        application.status = Application.Status.WITHDRAWN
        application.save(update_fields=['status', 'updated_at'])

        return api_response(
            success=True,
            message="Application withdrawn successfully.",
            data=ApplicationSerializer(application).data
        )


class RecruiterJobApplicantsAPIView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]
    serializer_class = ApplicationSerializer

    def get_queryset(self):
        job_id = self.kwargs.get('job_id')
        return Application.objects.filter(job_id=job_id, job__created_by=self.request.user).select_related('job', 'candidate', 'candidate__user').order_by('-applied_at')

    def list(self, request, *args, **kwargs):
        job_id = self.kwargs.get('job_id')
        try:
            job = Job.objects.get(pk=job_id)
        except Job.DoesNotExist:
            return api_response(
                success=False,
                message="Job not found.",
                http_status=status.HTTP_404_NOT_FOUND
            )

        # Verify ownership
        if job.created_by != request.user:
            return api_response(
                success=False,
                message="You do not have permission to access applicants for this job.",
                http_status=status.HTTP_403_FORBIDDEN
            )

        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return api_response(
            success=True,
            message="Job applicants retrieved successfully.",
            data=serializer.data
        )


class RecruiterApplicationStatusUpdateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]

    def patch(self, request, pk):
        try:
            application = Application.objects.select_related('job').get(pk=pk)
        except Application.DoesNotExist:
            return api_response(
                success=False,
                message="Application not found.",
                http_status=status.HTTP_404_NOT_FOUND
            )

        # Recruiter ownership check
        if application.job.created_by != request.user:
            return api_response(
                success=False,
                message="You do not have permission to update this application.",
                http_status=status.HTTP_403_FORBIDDEN
            )

        serializer = ApplicationStatusUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(
                success=False,
                message="Invalid status update.",
                data=serializer.errors,
                http_status=status.HTTP_400_BAD_REQUEST
            )

        application.status = serializer.validated_data['status']
        application.save(update_fields=['status', 'updated_at'])

        return api_response(
            success=True,
            message=f"Application status updated to {application.status}.",
            data=ApplicationSerializer(application).data
        )
