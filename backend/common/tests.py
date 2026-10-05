from django.test import TestCase
from rest_framework.test import APIRequestFactory
from accounts.models import User
from companies.models import Company
from profiles.models import CandidateProfile, RecruiterProfile
from jobs.models import Job
from common.permissions import (
    IsCandidate,
    IsRecruiter,
    IsAdminRole,
    IsCandidateOwner,
    IsRecruiterJobOwner,
    IsRecruiterCompanyOwner
)


class PermissionUnitTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()

        # Users
        self.candidate_a_user = User.objects.create_user(
            email="candidate_a@example.com",
            password="Password123!",
            role=User.Role.CANDIDATE
        )
        self.candidate_a_profile = CandidateProfile.objects.create(user=self.candidate_a_user, full_name="Candidate A")

        self.candidate_b_user = User.objects.create_user(
            email="candidate_b@example.com",
            password="Password123!",
            role=User.Role.CANDIDATE
        )
        self.candidate_b_profile = CandidateProfile.objects.create(user=self.candidate_b_user, full_name="Candidate B")

        self.recruiter_a_user = User.objects.create_user(
            email="recruiter_a@example.com",
            password="Password123!",
            role=User.Role.RECRUITER
        )
        self.company_a = Company.objects.create(name="Company A")
        self.recruiter_a_profile = RecruiterProfile.objects.create(user=self.recruiter_a_user, company=self.company_a)

        self.recruiter_b_user = User.objects.create_user(
            email="recruiter_b@example.com",
            password="Password123!",
            role=User.Role.RECRUITER
        )
        self.company_b = Company.objects.create(name="Company B")
        self.recruiter_b_profile = RecruiterProfile.objects.create(user=self.recruiter_b_user, company=self.company_b)

        self.admin_user = User.objects.create_superuser(
            email="admin@example.com",
            password="Password123!",
            role=User.Role.ADMIN
        )

        # Job created by Recruiter A
        self.job_a = Job.objects.create(
            company=self.company_a,
            created_by=self.recruiter_a_user,
            title="Python Developer",
            description="Python job",
            location="Remote"
        )

    def test_is_candidate_permission(self):
        perm = IsCandidate()

        req_candidate = self.factory.get('/')
        req_candidate.user = self.candidate_a_user
        self.assertTrue(perm.has_permission(req_candidate, None))

        req_recruiter = self.factory.get('/')
        req_recruiter.user = self.recruiter_a_user
        self.assertFalse(perm.has_permission(req_recruiter, None))

    def test_is_recruiter_permission(self):
        perm = IsRecruiter()

        req_recruiter = self.factory.get('/')
        req_recruiter.user = self.recruiter_a_user
        self.assertTrue(perm.has_permission(req_recruiter, None))

        req_candidate = self.factory.get('/')
        req_candidate.user = self.candidate_a_user
        self.assertFalse(perm.has_permission(req_candidate, None))

    def test_is_admin_permission(self):
        perm = IsAdminRole()

        req_admin = self.factory.get('/')
        req_admin.user = self.admin_user
        self.assertTrue(perm.has_permission(req_admin, None))

        req_candidate = self.factory.get('/')
        req_candidate.user = self.candidate_a_user
        self.assertFalse(perm.has_permission(req_candidate, None))

    def test_candidate_ownership_security(self):
        perm = IsCandidateOwner()

        req_a = self.factory.get('/')
        req_a.user = self.candidate_a_user

        # Candidate A accessing Candidate A's profile -> Granted
        self.assertTrue(perm.has_object_permission(req_a, None, self.candidate_a_profile))

        # Candidate A attempting to access Candidate B's profile -> Denied
        self.assertFalse(perm.has_object_permission(req_a, None, self.candidate_b_profile))

    def test_recruiter_job_ownership_security(self):
        perm = IsRecruiterJobOwner()

        # Recruiter A accessing Recruiter A's job -> Granted
        req_a = self.factory.get('/')
        req_a.user = self.recruiter_a_user
        self.assertTrue(perm.has_object_permission(req_a, None, self.job_a))

        # Recruiter B attempting to modify Recruiter A's job -> Denied
        req_b = self.factory.get('/')
        req_b.user = self.recruiter_b_user
        self.assertFalse(perm.has_object_permission(req_b, None, self.job_a))

        # Candidate attempting to modify Recruiter A's job -> Denied
        req_candidate = self.factory.get('/')
        req_candidate.user = self.candidate_a_user
        self.assertFalse(perm.has_object_permission(req_candidate, None, self.job_a))
