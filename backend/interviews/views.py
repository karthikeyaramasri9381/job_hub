from rest_framework import generics, permissions, status
from rest_framework.views import APIView

from .models import Interview
from applications.models import Application
from .serializers import InterviewSerializer, CreateInterviewSerializer
from common.permissions import IsCandidate, IsRecruiter
from common.utils import api_response


class ScheduleInterviewAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]

    def post(self, request, application_id):
        try:
            application = Application.objects.select_related('job').get(pk=application_id)
        except Application.DoesNotExist:
            return api_response(
                success=False,
                message="Application not found.",
                http_status=status.HTTP_404_NOT_FOUND
            )

        if application.job.created_by != request.user:
            return api_response(
                success=False,
                message="You do not have permission to schedule interviews for this application.",
                http_status=status.HTTP_403_FORBIDDEN
            )

        serializer = CreateInterviewSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(
                success=False,
                message="Invalid interview schedule data.",
                data=serializer.errors,
                http_status=status.HTTP_400_BAD_REQUEST
            )

        interview = serializer.save(
            application=application,
            status=Interview.Status.SCHEDULED
        )

        # Update application status to INTERVIEW automatically
        if application.status != Application.Status.INTERVIEW:
            application.status = Application.Status.INTERVIEW
            application.save(update_fields=['status', 'updated_at'])

        return api_response(
            success=True,
            message="Interview scheduled successfully.",
            data=InterviewSerializer(interview).data,
            http_status=status.HTTP_201_CREATED
        )


class CandidateInterviewsListAPIView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsCandidate]
    serializer_class = InterviewSerializer

    def get_queryset(self):
        return Interview.objects.filter(
            application__candidate__user=self.request.user
        ).select_related(
            'application', 'application__job', 'application__job__company', 'application__candidate'
        ).order_by('interview_date', 'interview_time')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return api_response(
            success=True,
            message="Candidate interviews retrieved successfully.",
            data=serializer.data
        )


class RecruiterInterviewsListAPIView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]
    serializer_class = InterviewSerializer

    def get_queryset(self):
        return Interview.objects.filter(
            application__job__created_by=self.request.user
        ).select_related(
            'application', 'application__job', 'application__job__company', 'application__candidate', 'application__candidate__user'
        ).order_by('interview_date', 'interview_time')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return api_response(
            success=True,
            message="Recruiter scheduled interviews retrieved successfully.",
            data=serializer.data
        )


class RecruiterInterviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]
    serializer_class = InterviewSerializer
    queryset = Interview.objects.all()

    def get_queryset(self):
        return Interview.objects.filter(application__job__created_by=self.request.user)

    def update(self, request, *args, **kwargs):
        interview = self.get_object()
        serializer = self.get_serializer(interview, data=request.data, partial=True)
        if not serializer.is_valid():
            return api_response(
                success=False,
                message="Interview update failed.",
                data=serializer.errors,
                http_status=status.HTTP_400_BAD_REQUEST
            )
        updated_interview = serializer.save()
        return api_response(
            success=True,
            message="Interview updated successfully.",
            data=InterviewSerializer(updated_interview).data
        )
