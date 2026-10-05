from rest_framework import serializers
from .models import Job, SavedJob
from companies.models import Company
from profiles.models import Skill


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ('id', 'name')


class JobSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    company_logo = serializers.CharField(source='company.logo', read_only=True)
    company_location = serializers.CharField(source='company.location', read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    created_by_email = serializers.EmailField(source='created_by.email', read_only=True)
    is_saved = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = (
            'id', 'company', 'company_name', 'company_logo', 'company_location',
            'created_by', 'created_by_email', 'title', 'description', 'location',
            'employment_type', 'work_mode', 'experience_level', 'salary_min',
            'salary_max', 'currency', 'responsibilities', 'qualifications',
            'application_deadline', 'status', 'skills', 'is_saved', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_by', 'created_at', 'updated_at')

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated and hasattr(request.user, 'candidate_profile'):
            return SavedJob.objects.filter(candidate=request.user.candidate_profile, job=obj).exists()
        return False


class JobCreateUpdateSerializer(serializers.ModelSerializer):
    skill_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        write_only=True
    )

    class Meta:
        model = Job
        fields = (
            'id', 'title', 'description', 'location', 'employment_type',
            'work_mode', 'experience_level', 'salary_min', 'salary_max',
            'currency', 'responsibilities', 'qualifications',
            'application_deadline', 'status', 'skill_ids'
        )

    def create(self, validated_data):
        skill_ids = validated_data.pop('skill_ids', [])
        user = self.context['request'].user
        
        # Determine company from user's recruiter profile
        if hasattr(user, 'recruiter_profile') and user.recruiter_profile.company:
            company = user.recruiter_profile.company
        else:
            raise serializers.ValidationError({"company": "You must create or be assigned to a company before posting a job."})

        job = Job.objects.create(
            company=company,
            created_by=user,
            **validated_data
        )

        if skill_ids:
            skills = Skill.objects.filter(id__in=skill_ids)
            job.skills.set(skills)

        return job

    def update(self, instance, validated_data):
        skill_ids = validated_data.pop('skill_ids', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if skill_ids is not None:
            skills = Skill.objects.filter(id__in=skill_ids)
            instance.skills.set(skills)

        return instance
