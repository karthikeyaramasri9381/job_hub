from rest_framework import serializers
from .models import (
    CandidateProfile,
    RecruiterProfile,
    Education,
    Experience,
    Skill,
    CandidateSkill
)


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ('id', 'degree', 'institution', 'field_of_study', 'start_date', 'end_date', 'grade')
        read_only_fields = ('id',)


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = ('id', 'job_title', 'company_name', 'location', 'start_date', 'end_date', 'description')
        read_only_fields = ('id',)


class CandidateSkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source='skill.name', read_only=True)

    class Meta:
        model = CandidateSkill
        fields = ('id', 'skill', 'skill_name', 'skill_level')
        read_only_fields = ('id',)


class CandidateProfileSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    education = EducationSerializer(many=True, read_only=True)
    experience = ExperienceSerializer(many=True, read_only=True)
    skills = CandidateSkillSerializer(source='candidate_skills', many=True, read_only=True)

    class Meta:
        model = CandidateProfile
        fields = (
            'id', 'user_email', 'full_name', 'headline', 'phone', 'location',
            'bio', 'profile_photo', 'resume', 'linkedin_url', 'github_url',
            'portfolio_url', 'education', 'experience', 'skills', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'user_email', 'created_at', 'updated_at')


class CandidateProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CandidateProfile
        fields = (
            'full_name', 'headline', 'phone', 'location', 'bio',
            'profile_photo', 'resume', 'linkedin_url', 'github_url', 'portfolio_url'
        )


class AddCandidateSkillSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    skill_level = serializers.ChoiceField(
        choices=CandidateSkill.SkillLevel.choices,
        default=CandidateSkill.SkillLevel.INTERMEDIATE
    )

    def create(self, validated_data):
        candidate = self.context['candidate']
        name = validated_data['name'].strip()
        skill, _ = Skill.objects.get_or_create(name=name)

        candidate_skill, _ = CandidateSkill.objects.update_or_create(
            candidate=candidate,
            skill=skill,
            defaults={'skill_level': validated_data.get('skill_level', CandidateSkill.SkillLevel.INTERMEDIATE)}
        )
        return candidate_skill


class RecruiterProfileSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = RecruiterProfile
        fields = ('id', 'user_email', 'company', 'company_name', 'designation', 'phone', 'created_at')
        read_only_fields = ('id', 'user_email', 'created_at')
