from django.urls import path
from .views import (
    PublicJobListAPIView,
    PublicJobDetailAPIView,
    RecruiterJobListCreateView,
    RecruiterJobDetailView,
    RecruiterJobPublishView,
    RecruiterJobCloseView,
    ToggleSaveJobAPIView,
    CandidateSavedJobsListAPIView
)

urlpatterns = [
    # Public Job APIs
    path('jobs/', PublicJobListAPIView.as_view(), name='public_job_list'),
    path('jobs/<int:pk>/', PublicJobDetailAPIView.as_view(), name='public_job_detail'),

    # Saved Job APIs
    path('jobs/<int:pk>/save/', ToggleSaveJobAPIView.as_view(), name='toggle_save_job'),
    path('candidate/saved-jobs/', CandidateSavedJobsListAPIView.as_view(), name='candidate_saved_jobs'),

    # Recruiter Job Management APIs
    path('recruiter/jobs/', RecruiterJobListCreateView.as_view(), name='recruiter_job_list_create'),
    path('recruiter/jobs/<int:pk>/', RecruiterJobDetailView.as_view(), name='recruiter_job_detail'),
    path('recruiter/jobs/<int:pk>/publish/', RecruiterJobPublishView.as_view(), name='recruiter_job_publish'),
    path('recruiter/jobs/<int:pk>/close/', RecruiterJobCloseView.as_view(), name='recruiter_job_close'),
]
