from django.urls import path
from .views import (
    ScheduleInterviewAPIView,
    CandidateInterviewsListAPIView,
    RecruiterInterviewsListAPIView,
    RecruiterInterviewDetailView
)

urlpatterns = [
    path('recruiter/applications/<int:application_id>/interview/', ScheduleInterviewAPIView.as_view(), name='schedule_interview'),
    path('candidate/interviews/', CandidateInterviewsListAPIView.as_view(), name='candidate_interviews'),
    path('recruiter/interviews/', RecruiterInterviewsListAPIView.as_view(), name='recruiter_interviews'),
    path('recruiter/interviews/<int:pk>/', RecruiterInterviewDetailView.as_view(), name='recruiter_interview_detail'),
]
