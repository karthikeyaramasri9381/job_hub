from rest_framework import status, permissions
from rest_framework.views import APIView
from .models import Company
from .serializers import CompanySerializer
from common.permissions import IsRecruiter
from common.utils import api_response


class RecruiterCompanyView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]

    def get(self, request):
        recruiter_profile = getattr(request.user, 'recruiter_profile', None)
        if not recruiter_profile or not recruiter_profile.company:
            return api_response(
                success=True,
                message="No company profile found for this recruiter.",
                data=None,
                http_status=status.HTTP_200_OK
            )
        serializer = CompanySerializer(recruiter_profile.company)
        return api_response(
            success=True,
            message="Company details retrieved successfully.",
            data=serializer.data
        )

    def post(self, request):
        recruiter_profile = getattr(request.user, 'recruiter_profile', None)
        if not recruiter_profile:
            return api_response(
                success=False,
                message="Recruiter profile required.",
                http_status=status.HTTP_400_BAD_REQUEST
            )

        if recruiter_profile.company:
            return api_response(
                success=False,
                message="Company already exists for this recruiter. Use PUT to update.",
                http_status=status.HTTP_400_BAD_REQUEST
            )

        serializer = CompanySerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(
                success=False,
                message="Invalid company data.",
                data=serializer.errors,
                http_status=status.HTTP_400_BAD_REQUEST
            )

        company = serializer.save()
        recruiter_profile.company = company
        recruiter_profile.save(update_fields=['company'])

        return api_response(
            success=True,
            message="Company profile created successfully.",
            data=CompanySerializer(company).data,
            http_status=status.HTTP_201_CREATED
        )

    def put(self, request):
        recruiter_profile = getattr(request.user, 'recruiter_profile', None)
        if not recruiter_profile or not recruiter_profile.company:
            return api_response(
                success=False,
                message="No company found to update. Create a company first.",
                http_status=status.HTTP_404_NOT_FOUND
            )

        serializer = CompanySerializer(
            recruiter_profile.company,
            data=request.data,
            partial=(request.method == 'PATCH')
        )
        if not serializer.is_valid():
            return api_response(
                success=False,
                message="Company update failed.",
                data=serializer.errors,
                http_status=status.HTTP_400_BAD_REQUEST
            )

        company = serializer.save()
        return api_response(
            success=True,
            message="Company details updated successfully.",
            data=CompanySerializer(company).data
        )
