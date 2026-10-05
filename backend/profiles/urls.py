from django.urls import path
from .views import (
    CandidateProfileView,
    EducationListCreateView,
    EducationDetailView,
    ExperienceListCreateView,
    ExperienceDetailView,
    CandidateSkillListCreateView,
    CandidateSkillDetailView,
    RecruiterProfileView
)

urlpatterns = [
    # Candidate Profile & Nested Items
    path('candidate/profile/', CandidateProfileView.as_view(), name='candidate_profile'),
    path('candidate/education/', EducationListCreateView.as_view(), name='candidate_education_list'),
    path('candidate/education/<int:pk>/', EducationDetailView.as_view(), name='candidate_education_detail'),
    path('candidate/experience/', ExperienceListCreateView.as_view(), name='candidate_experience_list'),
    path('candidate/experience/<int:pk>/', ExperienceDetailView.as_view(), name='candidate_experience_detail'),
    path('candidate/skills/', CandidateSkillListCreateView.as_view(), name='candidate_skill_list'),
    path('candidate/skills/<int:pk>/', CandidateSkillDetailView.as_view(), name='candidate_skill_detail'),

    # Recruiter Profile
    path('recruiter/profile/', RecruiterProfileView.as_view(), name='recruiter_profile'),
]
