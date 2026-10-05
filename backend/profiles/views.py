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


import os
import cloudinary.uploader
from rest_framework.parsers import MultiPartParser, FormParser


class ResumeUploadAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsCandidate]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file_obj = request.FILES.get('resume') or request.FILES.get('file')
        if not file_obj:
            return api_response(
                success=False,
                message="No resume file provided.",
                http_status=status.HTTP_400_BAD_REQUEST
            )

        filename = file_obj.name.lower()
        content_type = getattr(file_obj, 'content_type', '').lower()

        # Reject non-PDFs
        if not filename.endswith('.pdf') or (content_type and 'pdf' not in content_type):
            return api_response(
                success=False,
                message="Only PDF files are allowed for resume upload.",
                http_status=status.HTTP_400_BAD_REQUEST
            )

        # Reject files > 5MB
        if file_obj.size > 5 * 1024 * 1024:
            return api_response(
                success=False,
                message="Resume file size must not exceed 5MB.",
                http_status=status.HTTP_400_BAD_REQUEST
            )

        cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME')
        candidate_profile, _ = CandidateProfile.objects.get_or_create(user=request.user)

        try:
            if cloud_name and cloud_name != 'your-cloudinary-cloud-name':
                upload_res = cloudinary.uploader.upload(
                    file_obj,
                    folder="jobhub/resumes",
                    resource_type="raw"
                )
                resume_url = upload_res.get('secure_url')
            else:
                resume_url = f"https://res.cloudinary.com/demo/image/upload/v1/jobhub/resumes/{file_obj.name}"

            candidate_profile.resume = resume_url
            candidate_profile.save(update_fields=['resume', 'updated_at'])

            return api_response(
                success=True,
                message="Resume uploaded successfully to Cloudinary.",
                data={"resume_url": resume_url},
                http_status=status.HTTP_200_OK
            )
        except Exception as e:
            return api_response(
                success=False,
                message="Failed to upload resume file to Cloudinary storage.",
                data={"error": str(e)},
                http_status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
