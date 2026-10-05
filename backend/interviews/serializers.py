from rest_framework import serializers
from .models import Interview
from applications.serializers import ApplicationSerializer


class InterviewSerializer(serializers.ModelSerializer):
    application_details = ApplicationSerializer(source='application', read_only=True)
    candidate_name = serializers.CharField(source='application.candidate.full_name', read_only=True)
    candidate_email = serializers.EmailField(source='application.candidate.user.email', read_only=True)
    job_title = serializers.CharField(source='application.job.title', read_only=True)
    company_name = serializers.CharField(source='application.job.company.name', read_only=True)

    class Meta:
        model = Interview
        fields = (
            'id', 'application', 'application_details', 'candidate_name',
            'candidate_email', 'job_title', 'company_name', 'interview_type',
            'interview_date', 'interview_time', 'meeting_link',
            'interviewer_name', 'notes', 'status', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class CreateInterviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interview
        fields = (
            'interview_type', 'interview_date', 'interview_time',
            'meeting_link', 'interviewer_name', 'notes'
        )
