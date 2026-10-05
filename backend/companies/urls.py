from django.urls import path
from .views import RecruiterCompanyView

urlpatterns = [
    path('recruiter/company/', RecruiterCompanyView.as_view(), name='recruiter_company'),
]
