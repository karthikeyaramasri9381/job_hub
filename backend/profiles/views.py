from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import (
    CandidateProfile,
    RecruiterProfile,
    Education,
    Experience,
    CandidateSkill,
    Skill
)
from .serializers import (
    CandidateProfileSerializer,
    CandidateProfileUpdateSerializer,
    EducationSerializer,
    ExperienceSerializer,
    CandidateSkillSerializer,
    AddCandidateSkillSerializer,
    RecruiterProfileSerializer
)
from common.permissions import IsCandidate, IsRecruiter, IsCandidateOwner
from common.utils import api_response


class CandidateProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsCandidate]

    def get(self, request):
        profile, _ = CandidateProfile.objects.get_or_create(user=request.user)
        serializer = CandidateProfileSerializer(profile)
        return api_response(
            success=True,
            message="Candidate profile retrieved.",
            data=serializer.data
        )

    def put(self, request):
        profile, _ = CandidateProfile.objects.get_or_create(user=request.user)
        serializer = CandidateProfileUpdateSerializer(
            profile,
            data=request.data,
            partial=(request.method == 'PATCH')
        )
        if not serializer.is_valid():
            return api_response(
                success=False,
                message="Profile update failed.",
                data=serializer.errors,
                http_status=status.HTTP_400_BAD_REQUEST
            )
        updated_profile = serializer.save()
        return api_response(
            success=True,
            message="Candidate profile updated successfully.",
            data=CandidateProfileSerializer(updated_profile).data
        )


class EducationListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsCandidate]
    serializer_class = EducationSerializer

    def get_queryset(self):
        return Education.objects.filter(candidate__user=self.request.user)

    def perform_create(self, serializer):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        serializer.save(candidate=profile)


class EducationDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsCandidate, IsCandidateOwner]
    serializer_class = EducationSerializer

    def get_queryset(self):
        return Education.objects.filter(candidate__user=self.request.user)


class ExperienceListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsCandidate]
    serializer_class = ExperienceSerializer

    def get_queryset(self):
        return Experience.objects.filter(candidate__user=self.request.user)

    def perform_create(self, serializer):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        serializer.save(candidate=profile)


class ExperienceDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsCandidate, IsCandidateOwner]
    serializer_class = ExperienceSerializer

    def get_queryset(self):
        return Experience.objects.filter(candidate__user=self.request.user)


class CandidateSkillListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsCandidate]

    def get(self, request):
        profile, _ = CandidateProfile.objects.get_or_create(user=request.user)
        skills = CandidateSkill.objects.filter(candidate=profile)
        serializer = CandidateSkillSerializer(skills, many=True)
        return api_response(
            success=True,
            message="Skills retrieved.",
            data=serializer.data
        )

    def post(self, request):
        profile, _ = CandidateProfile.objects.get_or_create(user=request.user)
        serializer = AddCandidateSkillSerializer(data=request.data, context={'candidate': profile})
        if not serializer.is_valid():
            return api_response(
                success=False,
                message="Failed to add skill.",
                data=serializer.errors,
                http_status=status.HTTP_400_BAD_REQUEST
            )
        candidate_skill = serializer.save()
        return api_response(
            success=True,
            message="Skill added successfully.",
            data=CandidateSkillSerializer(candidate_skill).data,
            http_status=status.HTTP_201_CREATED
        )


class CandidateSkillDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsCandidate]

    def delete(self, request, pk):
        profile, _ = CandidateProfile.objects.get_or_create(user=request.user)
        try:
            candidate_skill = CandidateSkill.objects.get(pk=pk, candidate=profile)
            candidate_skill.delete()
            return api_response(
                success=True,
                message="Skill deleted successfully."
            )
        except CandidateSkill.DoesNotExist:
            return api_response(
                success=False,
                message="Skill not found.",
                http_status=status.HTTP_404_NOT_FOUND
            )


class RecruiterProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]

    def get(self, request):
        profile, _ = RecruiterProfile.objects.get_or_create(user=request.user)
        serializer = RecruiterProfileSerializer(profile)
        return api_response(
            success=True,
            message="Recruiter profile retrieved.",
            data=serializer.data
        )

    def put(self, request):
        profile, _ = RecruiterProfile.objects.get_or_create(user=request.user)
        serializer = RecruiterProfileSerializer(profile, data=request.data, partial=True)
        if not serializer.is_valid():
            return api_response(
                success=False,
                message="Profile update failed.",
                data=serializer.errors,
                http_status=status.HTTP_400_BAD_REQUEST
            )
        updated_profile = serializer.save()
        return api_response(
            success=True,
            message="Recruiter profile updated successfully.",
            data=RecruiterProfileSerializer(updated_profile).data
        )
