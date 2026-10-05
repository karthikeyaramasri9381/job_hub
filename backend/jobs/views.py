from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from .models import Job
from .serializers import JobSerializer, JobCreateUpdateSerializer
from common.permissions import IsRecruiter, IsRecruiterJobOwner
from common.utils import api_response


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return api_response(
            success=True,
            message="Jobs retrieved successfully.",
            data={
                'count': self.page.paginator.count,
                'total_pages': self.page.paginator.num_pages,
                'current_page': self.page.number,
                'next': self.get_next_link(),
                'previous': self.get_previous_link(),
                'results': data
            }
        )


class PublicJobListAPIView(generics.ListAPIView):
    serializer_class = JobSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = Job.objects.filter(status=Job.Status.PUBLISHED).select_related('company', 'created_by').prefetch_related('skills')

        # 1. Backend Search (title, description, company, location, skills)
        search_query = self.request.query_params.get('search') or self.request.query_params.get('q')
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(company__name__icontains=search_query) |
                Q(location__icontains=search_query) |
                Q(skills__name__icontains=search_query)
            ).distinct()

        # 2. Filters
        location = self.request.query_params.get('location')
        if location:
            queryset = queryset.filter(location__icontains=location)

        employment_type = self.request.query_params.get('employment_type')
        if employment_type:
            queryset = queryset.filter(employment_type__iexact=employment_type)

        work_mode = self.request.query_params.get('work_mode')
        if work_mode:
            queryset = queryset.filter(work_mode__iexact=work_mode)

        experience_level = self.request.query_params.get('experience_level')
        if experience_level:
            queryset = queryset.filter(experience_level__iexact=experience_level)

        salary_min = self.request.query_params.get('salary_min')
        if salary_min and salary_min.isdigit():
            queryset = queryset.filter(salary_max__gte=decimal.Decimal(salary_min) if False else float(salary_min))

        # 3. Sorting
        sort_by = self.request.query_params.get('sort') or self.request.query_params.get('ordering')
        if sort_by == 'oldest':
            queryset = queryset.order_by('created_at')
        elif sort_by == 'salary_high':
            queryset = queryset.order_by('-salary_max', '-salary_min')
        elif sort_by == 'salary_low':
            queryset = queryset.order_by('salary_min', 'salary_max')
        else:  # 'newest' by default
            queryset = queryset.order_by('-created_at')

        return queryset


class PublicJobDetailAPIView(generics.RetrieveAPIView):
    queryset = Job.objects.filter(status=Job.Status.PUBLISHED).select_related('company', 'created_by').prefetch_related('skills')
    serializer_class = JobSerializer
    permission_classes = [permissions.AllowAny]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, context={'request': request})
        return api_response(
            success=True,
            message="Job details retrieved successfully.",
            data=serializer.data
        )


class RecruiterJobListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]
    pagination_class = StandardResultsSetPagination

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return JobCreateUpdateSerializer
        return JobSerializer

    def get_queryset(self):
        return Job.objects.filter(created_by=self.request.user).select_related('company', 'created_by').order_by('-created_at')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return api_response(
                success=False,
                message="Failed to create job due to validation errors.",
                data=serializer.errors,
                http_status=status.HTTP_400_BAD_REQUEST
            )
        job = serializer.save()
        return api_response(
            success=True,
            message="Job created successfully.",
            data=JobSerializer(job, context={'request': request}).data,
            http_status=status.HTTP_201_CREATED
        )


class RecruiterJobDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsRecruiter, IsRecruiterJobOwner]
    queryset = Job.objects.all()

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return JobCreateUpdateSerializer
        return JobSerializer

    def retrieve(self, request, *args, **kwargs):
        job = self.get_object()
        return api_response(
            success=True,
            message="Job details retrieved.",
            data=JobSerializer(job, context={'request': request}).data
        )

    def update(self, request, *args, **kwargs):
        job = self.get_object()
        serializer = self.get_serializer(job, data=request.data, partial=(request.method == 'PATCH'), context={'request': request})
        if not serializer.is_valid():
            return api_response(
                success=False,
                message="Job update failed.",
                data=serializer.errors,
                http_status=status.HTTP_400_BAD_REQUEST
            )
        updated_job = serializer.save()
        return api_response(
            success=True,
            message="Job updated successfully.",
            data=JobSerializer(updated_job, context={'request': request}).data
        )

    def destroy(self, request, *args, **kwargs):
        job = self.get_object()
        job.delete()
        return api_response(
            success=True,
            message="Job deleted successfully.",
            http_status=status.HTTP_200_OK
        )


class RecruiterJobPublishView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsRecruiter, IsRecruiterJobOwner]

    def post(self, request, pk):
        try:
            job = Job.objects.get(pk=pk)
        except Job.DoesNotExist:
            return api_response(
                success=False,
                message="Job not found.",
                http_status=status.HTTP_404_NOT_FOUND
            )

        self.check_object_permissions(request, job)
        job.status = Job.Status.PUBLISHED
        job.save(update_fields=['status', 'updated_at'])

        return api_response(
            success=True,
            message="Job published successfully.",
            data=JobSerializer(job, context={'request': request}).data
        )


class RecruiterJobCloseView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsRecruiter, IsRecruiterJobOwner]

    def post(self, request, pk):
        try:
            job = Job.objects.get(pk=pk)
        except Job.DoesNotExist:
            return api_response(
                success=False,
                message="Job not found.",
                http_status=status.HTTP_404_NOT_FOUND
            )

        self.check_object_permissions(request, job)
        job.status = Job.Status.CLOSED
        job.save(update_fields=['status', 'updated_at'])

        return api_response(
            success=True,
            message="Job closed successfully.",
            data=JobSerializer(job, context={'request': request}).data
        )
