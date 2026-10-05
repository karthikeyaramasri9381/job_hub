from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from accounts.models import User
from companies.models import Company
from profiles.models import CandidateProfile, RecruiterProfile
from jobs.models import Job
from applications.models import Application


class ApplicationAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Recruiter A & Job A
        self.recruiter_a = User.objects.create_user(
            email="recruiter_a_app@example.com",
            password="Password123!",
            role=User.Role.RECRUITER
        )
        self.company_a = Company.objects.create(name="TechCorp A")
        self.recruiter_a_profile = RecruiterProfile.objects.create(user=self.recruiter_a, company=self.company_a)
        self.job_a = Job.objects.create(
            company=self.company_a,
            created_by=self.recruiter_a,
            title="Senior Developer",
            description="Build cool stuff",
            location="Remote",
            status=Job.Status.PUBLISHED
        )

        # Recruiter B
        self.recruiter_b = User.objects.create_user(
            email="recruiter_b_app@example.com",
            password="Password123!",
            role=User.Role.RECRUITER
        )

        # Candidate
        self.candidate_user = User.objects.create_user(
            email="candidate_app@example.com",
            password="Password123!",
            role=User.Role.CANDIDATE
        )
        self.candidate_profile = CandidateProfile.objects.create(user=self.candidate_user, full_name="Candidate Applicant")

    def test_candidate_apply_job_and_duplicate_prevention(self):
        self.client.force_authenticate(user=self.candidate_user)
        apply_url = reverse('job_apply', kwargs={'job_id': self.job_a.pk})

        # Initial Application
        payload = {"cover_letter": "I love this role!"}
        res_apply = self.client.post(apply_url, payload, format='json')
        self.assertEqual(res_apply.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res_apply.data['success'])

        # Verify DB state
        self.assertEqual(Application.objects.count(), 1)
        self.assertEqual(Application.objects.first().status, Application.Status.APPLIED)

        # Duplicate Application Attempt -> Must fail with 409 Conflict
        res_dup = self.client.post(apply_url, payload, format='json')
        self.assertEqual(res_dup.status_code, status.HTTP_409_CONFLICT)
        self.assertFalse(res_dup.data['success'])

    def test_recruiter_applicant_view_and_ownership_protection(self):
        # Create application
        app = Application.objects.create(
            candidate=self.candidate_profile,
            job=self.job_a,
            status=Application.Status.APPLIED
        )

        apps_url = reverse('recruiter_job_applications', kwargs={'job_id': self.job_a.pk})

        # Recruiter A (owner) retrieves applicants -> 200 OK
        self.client.force_authenticate(user=self.recruiter_a)
        res_owner = self.client.get(apps_url)
        self.assertEqual(res_owner.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_owner.data['data']), 1)

        # Recruiter B attempts to view applicants for Recruiter A's job -> 403 Forbidden
        self.client.force_authenticate(user=self.recruiter_b)
        res_other = self.client.get(apps_url)
        self.assertEqual(res_other.status_code, status.HTTP_403_FORBIDDEN)

    def test_recruiter_update_status_and_candidate_withdraw(self):
        app = Application.objects.create(
            candidate=self.candidate_profile,
            job=self.job_a,
            status=Application.Status.APPLIED
        )

        # Recruiter A updates status to SHORTLISTED
        self.client.force_authenticate(user=self.recruiter_a)
        status_url = reverse('recruiter_application_status_update', kwargs={'pk': app.pk})
        res_status = self.client.patch(status_url, {"status": "SHORTLISTED"}, format='json')
        self.assertEqual(res_status.status_code, status.HTTP_200_OK)
        app.refresh_from_db()
        self.assertEqual(app.status, Application.Status.SHORTLISTED)

        # Candidate withdraws application
        self.client.force_authenticate(user=self.candidate_user)
        withdraw_url = reverse('candidate_application_withdraw', kwargs={'pk': app.pk})
        res_withdraw = self.client.post(withdraw_url)
        self.assertEqual(res_withdraw.status_code, status.HTTP_200_OK)
        app.refresh_from_db()
        self.assertEqual(app.status, Application.Status.WITHDRAWN)
