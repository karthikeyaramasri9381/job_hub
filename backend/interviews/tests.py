from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from accounts.models import User
from companies.models import Company
from profiles.models import CandidateProfile, RecruiterProfile
from jobs.models import Job
from applications.models import Application
from interviews.models import Interview


class InterviewAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Recruiter A & Job A
        self.recruiter_a = User.objects.create_user(
            email="recruiter_a_int@example.com",
            password="Password123!",
            role=User.Role.RECRUITER
        )
        self.company_a = Company.objects.create(name="TechCorp A")
        self.recruiter_a_profile = RecruiterProfile.objects.create(user=self.recruiter_a, company=self.company_a)
        self.job_a = Job.objects.create(
            company=self.company_a,
            created_by=self.recruiter_a,
            title="Python Developer",
            description="Django backend role",
            location="Remote",
            status=Job.Status.PUBLISHED
        )

        # Recruiter B
        self.recruiter_b = User.objects.create_user(
            email="recruiter_b_int@example.com",
            password="Password123!",
            role=User.Role.RECRUITER
        )

        # Candidate
        self.candidate_user = User.objects.create_user(
            email="candidate_int@example.com",
            password="Password123!",
            role=User.Role.CANDIDATE
        )
        self.candidate_profile = CandidateProfile.objects.create(user=self.candidate_user, full_name="Candidate Interviewee")

        # Application
        self.application = Application.objects.create(
            candidate=self.candidate_profile,
            job=self.job_a,
            status=Application.Status.SHORTLISTED
        )

    def test_recruiter_schedule_interview_and_candidate_view(self):
        self.client.force_authenticate(user=self.recruiter_a)
        url = reverse('schedule_interview', kwargs={'application_id': self.application.pk})

        payload = {
            "interview_type": "VIDEO",
            "interview_date": "2026-10-15",
            "interview_time": "14:00:00",
            "meeting_link": "https://meet.google.com/abc-defg-hij",
            "interviewer_name": "Jane Tech Lead",
            "notes": "Technical System Design round"
        }
        res_schedule = self.client.post(url, payload, format='json')
        self.assertEqual(res_schedule.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res_schedule.data['success'])

        # Verify DB state
        self.assertEqual(Interview.objects.count(), 1)
        interview = Interview.objects.first()
        self.assertEqual(interview.status, Interview.Status.SCHEDULED)
        
        # Verify application status auto-updated to INTERVIEW
        self.application.refresh_from_db()
        self.assertEqual(self.application.status, Application.Status.INTERVIEW)

        # Candidate fetches interviews -> 200 OK
        self.client.force_authenticate(user=self.candidate_user)
        cand_url = reverse('candidate_interviews')
        res_cand = self.client.get(cand_url)
        self.assertEqual(res_cand.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_cand.data['data']), 1)

    def test_recruiter_b_cannot_schedule_interview_for_recruiter_a_applicant(self):
        self.client.force_authenticate(user=self.recruiter_b)
        url = reverse('schedule_interview', kwargs={'application_id': self.application.pk})
        payload = {
            "interview_type": "VIDEO",
            "interview_date": "2026-10-15",
            "interview_time": "14:00:00"
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
