from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from accounts.models import User
from companies.models import Company
from profiles.models import RecruiterProfile, CandidateProfile
from jobs.models import Job, SavedJob


class JobAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Recruiter A & Company A
        self.recruiter_a = User.objects.create_user(
            email="recruiter_a@example.com",
            password="Password123!",
            role=User.Role.RECRUITER
        )
        self.company_a = Company.objects.create(name="TechCorp")
        self.recruiter_a_profile = RecruiterProfile.objects.create(user=self.recruiter_a, company=self.company_a)

        # Recruiter B & Company B
        self.recruiter_b = User.objects.create_user(
            email="recruiter_b@example.com",
            password="Password123!",
            role=User.Role.RECRUITER
        )
        self.company_b = Company.objects.create(name="CloudInc")
        self.recruiter_b_profile = RecruiterProfile.objects.create(user=self.recruiter_b, company=self.company_b)

        # Candidate
        self.candidate = User.objects.create_user(
            email="candidate@example.com",
            password="Password123!",
            role=User.Role.CANDIDATE
        )
        self.candidate_profile = CandidateProfile.objects.create(user=self.candidate, full_name="Candidate User")

    def test_recruiter_create_job(self):
        self.client.force_authenticate(user=self.recruiter_a)
        url = reverse('recruiter_job_list_create')
        payload = {
            "title": "Senior Python Engineer",
            "description": "Develop scalable APIs",
            "location": "Remote",
            "employment_type": "FULL_TIME",
            "work_mode": "REMOTE",
            "experience_level": "SENIOR",
            "salary_min": 100000,
            "salary_max": 140000,
            "currency": "USD"
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertEqual(Job.objects.count(), 1)
        self.assertEqual(Job.objects.first().status, Job.Status.DRAFT)

    def test_candidate_cannot_create_job(self):
        self.client.force_authenticate(user=self.candidate)
        url = reverse('recruiter_job_list_create')
        payload = {"title": "Illegal Job", "description": "Test", "location": "Remote"}
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_recruiter_publish_and_public_search(self):
        job = Job.objects.create(
            company=self.company_a,
            created_by=self.recruiter_a,
            title="Django Specialist",
            description="Django REST Framework expert needed",
            location="New York",
            work_mode="HYBRID",
            status=Job.Status.DRAFT
        )

        # Publish job
        self.client.force_authenticate(user=self.recruiter_a)
        publish_url = reverse('recruiter_job_publish', kwargs={'pk': job.pk})
        res_publish = self.client.post(publish_url)
        self.assertEqual(res_publish.status_code, status.HTTP_200_OK)
        job.refresh_from_db()
        self.assertEqual(job.status, Job.Status.PUBLISHED)

        # Public user search
        self.client.logout()
        public_url = reverse('public_job_list') + '?search=django&work_mode=HYBRID'
        res_search = self.client.get(public_url)
        self.assertEqual(res_search.status_code, status.HTTP_200_OK)
        self.assertEqual(res_search.data['data']['count'], 1)

    def test_recruiter_ownership_security_on_edit(self):
        job_a = Job.objects.create(
            company=self.company_a,
            created_by=self.recruiter_a,
            title="Recruiter A Job",
            description="Private job",
            location="Remote",
            status=Job.Status.PUBLISHED
        )

        # Recruiter B attempts to update Recruiter A's job
        self.client.force_authenticate(user=self.recruiter_b)
        url = reverse('recruiter_job_detail', kwargs={'pk': job_a.pk})
        response = self.client.put(url, {"title": "Hacked Title", "description": "Hacked", "location": "Remote"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_candidate_save_and_unsave_job(self):
        job = Job.objects.create(
            company=self.company_a,
            created_by=self.recruiter_a,
            title="Frontend Developer",
            description="React JS job",
            location="Remote",
            status=Job.Status.PUBLISHED
        )

        self.client.force_authenticate(user=self.candidate)
        save_url = reverse('toggle_save_job', kwargs={'pk': job.pk})

        # Save Job
        res_save = self.client.post(save_url)
        self.assertEqual(res_save.status_code, status.HTTP_201_CREATED)
        self.assertTrue(SavedJob.objects.filter(candidate=self.candidate_profile, job=job).exists())

        # Duplicate Save (Idempotent)
        res_dup = self.client.post(save_url)
        self.assertEqual(res_dup.status_code, status.HTTP_200_OK)

        # List Saved Jobs
        saved_list_url = reverse('candidate_saved_jobs')
        res_list = self.client.get(saved_list_url)
        self.assertEqual(res_list.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_list.data['data']), 1)

        # Unsave Job
        res_unsave = self.client.delete(save_url)
        self.assertEqual(res_unsave.status_code, status.HTTP_200_OK)
        self.assertFalse(SavedJob.objects.filter(candidate=self.candidate_profile, job=job).exists())
