from io import BytesIO
from django.test import TestCase
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APIClient

from accounts.models import User
from profiles.models import CandidateProfile, RecruiterProfile, Education, Experience, CandidateSkill, Skill
from companies.models import Company


class ProfileAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Candidate
        self.candidate_user = User.objects.create_user(
            email="candidate_profile@example.com",
            password="Password123!",
            role=User.Role.CANDIDATE
        )
        self.candidate_profile = CandidateProfile.objects.create(user=self.candidate_user, full_name="Candidate Profile User")

        # Recruiter
        self.recruiter_user = User.objects.create_user(
            email="recruiter_profile@example.com",
            password="Password123!",
            role=User.Role.RECRUITER
        )
        self.recruiter_profile = RecruiterProfile.objects.create(user=self.recruiter_user)

    def test_candidate_profile_get_and_update(self):
        self.client.force_authenticate(user=self.candidate_user)
        url = reverse('candidate_profile')

        # GET
        res_get = self.client.get(url)
        self.assertEqual(res_get.status_code, status.HTTP_200_OK)
        self.assertEqual(res_get.data['data']['full_name'], "Candidate Profile User")

        # PUT
        res_put = self.client.put(url, {"headline": "Full-Stack Engineer", "location": "San Francisco"}, format='json')
        self.assertEqual(res_put.status_code, status.HTTP_200_OK)
        self.candidate_profile.refresh_from_db()
        self.assertEqual(self.candidate_profile.headline, "Full-Stack Engineer")

    def test_candidate_education_experience_skills(self):
        self.client.force_authenticate(user=self.candidate_user)

        # Add Education
        edu_url = reverse('candidate_education_list')
        edu_res = self.client.post(edu_url, {
            "degree": "B.S. Computer Science",
            "institution": "Stanford University",
            "field_of_study": "CS",
            "start_date": "2018-09-01",
            "end_date": "2022-06-01",
            "grade": "3.9 GPA"
        }, format='json')
        self.assertEqual(edu_res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Education.objects.filter(candidate=self.candidate_profile).count(), 1)

        # Add Skill
        skill_url = reverse('candidate_skill_list')
        skill_res = self.client.post(skill_url, {"name": "Python", "skill_level": "ADVANCED"}, format='json')
        self.assertEqual(skill_res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CandidateSkill.objects.filter(candidate=self.candidate_profile).count(), 1)

    def test_resume_upload_pdf_only(self):
        self.client.force_authenticate(user=self.candidate_user)
        url = reverse('candidate_upload_resume')

        # Test non-PDF file rejection
        txt_file = SimpleUploadedFile("resume.txt", b"plain text resume", content_type="text/plain")
        res_txt = self.client.post(url, {"file": txt_file}, format='multipart')
        self.assertEqual(res_txt.status_code, status.HTTP_400_BAD_REQUEST)

        # Test valid PDF upload
        pdf_file = SimpleUploadedFile("my_resume.pdf", b"%PDF-1.4 sample pdf content", content_type="application/pdf")
        res_pdf = self.client.post(url, {"file": pdf_file}, format='multipart')
        self.assertEqual(res_pdf.status_code, status.HTTP_200_OK)
        self.assertTrue(res_pdf.data['success'])
        self.assertIn('resume_url', res_pdf.data['data'])

        self.candidate_profile.refresh_from_db()
        self.assertIsNotNone(self.candidate_profile.resume)

    def test_recruiter_company_creation(self):
        self.client.force_authenticate(user=self.recruiter_user)
        company_url = reverse('recruiter_company')

        # Create company
        res_create = self.client.post(company_url, {
            "name": "Innovate Tech",
            "description": "Building future tech",
            "industry": "Software",
            "location": "Boston"
        }, format='json')
        self.assertEqual(res_create.status_code, status.HTTP_201_CREATED)

        self.recruiter_profile.refresh_from_db()
        self.assertIsNotNone(self.recruiter_profile.company)
        self.assertEqual(self.recruiter_profile.company.name, "Innovate Tech")
