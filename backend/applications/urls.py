from django.urls import path
from .views import (
    ApplyJobAPIView,
    CandidateApplicationListAPIView,
    CandidateApplicationWithdrawAPIView,
    RecruiterJobApplicantsAPIView,
    RecruiterApplicationStatusUpdateAPIView
)

urlpatterns = [
    path('jobs/<int:job_id>/apply/', ApplyJobAPIView.as_view(), name='job_apply'),
    path('candidate/applications/', CandidateApplicationListAPIView.as_view(), name='candidate_applications'),
    path('candidate/applications/<int:pk>/withdraw/', CandidateApplicationWithdrawAPIView.as_view(), name='candidate_application_withdraw'),
    path('recruiter/jobs/<int:job_id>/applications/', RecruiterJobApplicantsAPIView.as_view(), name='recruiter_job_applications'),
    path('recruiter/applications/<int:pk>/status/', RecruiterApplicationStatusUpdateAPIView.as_view(), name='recruiter_application_status_update'),
]
