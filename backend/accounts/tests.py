from unittest.mock import patch
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from accounts.models import User
from profiles.models import CandidateProfile, RecruiterProfile


class AuthenticationAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('auth_register')
        self.login_url = reverse('auth_login')
        self.google_url = reverse('auth_google')
        self.refresh_url = reverse('auth_refresh')
        self.me_url = reverse('auth_me')
        self.logout_url = reverse('auth_logout')

    def test_candidate_registration(self):
        payload = {
            "email": "candidate@example.com",
            "password": "Password123!",
            "first_name": "John",
            "last_name": "Doe",
            "role": "CANDIDATE"
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertIn('access', response.data['data'])
        self.assertIn('refresh', response.data['data'])

        # Verify database state
        user = User.objects.get(email="candidate@example.com")
        self.assertEqual(user.role, User.Role.CANDIDATE)
        self.assertTrue(hasattr(user, 'candidate_profile'))
        self.assertEqual(user.candidate_profile.full_name, "John Doe")

    def test_recruiter_registration(self):
        payload = {
            "email": "recruiter@example.com",
            "password": "Password123!",
            "first_name": "Jane",
            "last_name": "Smith",
            "role": "RECRUITER"
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email="recruiter@example.com")
        self.assertEqual(user.role, User.Role.RECRUITER)
        self.assertTrue(hasattr(user, 'recruiter_profile'))

    def test_email_password_login(self):
        user = User.objects.create_user(
            email="login_user@example.com",
            password="SecurePassword123!",
            first_name="Alice",
            last_name="Johnson",
            role=User.Role.CANDIDATE
        )
        CandidateProfile.objects.create(user=user, full_name="Alice Johnson")

        login_payload = {
            "email": "login_user@example.com",
            "password": "SecurePassword123!"
        }
        response = self.client.post(self.login_url, login_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('access', response.data['data'])
        self.assertIn('user', response.data['data'])
        self.assertEqual(response.data['data']['user']['email'], "login_user@example.com")

    def test_google_login_invalid_token(self):
        response = self.client.post(self.google_url, {"id_token": "invalid_fake_token"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])

    @patch('google.oauth2.id_token.verify_oauth2_token')
    def test_google_login_success_mocked(self, mock_verify):
        mock_verify.return_value = {
            "email": "google_user@example.com",
            "given_name": "Google",
            "family_name": "User",
            "sub": "1234567890"
        }

        response = self.client.post(self.google_url, {"id_token": "valid_mocked_token", "role": "CANDIDATE"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertIn('access', response.data['data'])

        # Verify user created in DB
        user = User.objects.get(email="google_user@example.com")
        self.assertTrue(user.google_account)
        self.assertEqual(user.role, User.Role.CANDIDATE)
        self.assertTrue(hasattr(user, 'candidate_profile'))

    def test_authenticated_me_endpoint(self):
        user = User.objects.create_user(
            email="me_user@example.com",
            password="SecurePassword123!",
            first_name="Test",
            last_name="User"
        )
        self.client.force_authenticate(user=user)
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['email'], "me_user@example.com")
