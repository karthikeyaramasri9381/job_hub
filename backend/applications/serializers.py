from rest_framework import serializers
from .models import Application
from jobs.serializers import JobSerializer
from profiles.serializers import CandidateProfileSerializer


class ApplicationSerializer(serializers.ModelSerializer):
    job_details = JobSerializer(source='job', read_only=True)
    candidate_details = CandidateProfileSerializer(source='candidate', read_only=True)

    class Meta:
        model = Application
        fields = (
            'id', 'candidate', 'job', 'job_details', 'candidate_details',
            'resume', 'cover_letter', 'status', 'applied_at', 'updated_at'
        )
        read_only_fields = ('id', 'candidate', 'job', 'applied_at', 'updated_at')


class ApplyJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ('resume', 'cover_letter')


class ApplicationStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ('status',)

    def validate_status(self, value):
        allowed_statuses = [choice[0] for choice in Application.Status.choices]
        if value not in allowed_statuses:
            raise serializers.ValidationError(f"Invalid status choice. Allowed: {allowed_statuses}")
        return value
