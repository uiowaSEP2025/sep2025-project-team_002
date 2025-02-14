# tests/test_account.py

import pytest
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from users.models import Users  # import your Users model
from django.contrib.auth.hashers import make_password


@pytest.mark.django_db
class AccountTests(APITestCase):
    def setUp(self):
        # Create a test user
        self.user = Users.objects.create_user(
            email="testuser@example.com",
            first_name="Test",
            last_name="User",
            password="StrongP@ss123",
        )
        # Get JWT tokens by logging in
        url = reverse("login")  # e.g. name="login" in your urls
        response = self.client.post(
            url,
            {"email": "testuser@example.com", "password": "StrongP@ss123"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.access_token = response.data["access"]  # from your login response

        # Common header with Bearer token
        self.auth_header = {"HTTP_AUTHORIZATION": f"Bearer {self.access_token}"}

    def test_get_account_info(self):
        """
        Test that we can retrieve the current user's info
        """
        url = reverse(
            "user_detail"
        )  # e.g. path("user/", UserDetailView.as_view(), name="user_detail")
        response = self.client.get(url, **self.auth_header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "testuser@example.com")

    def test_patch_account_settings(self):
        """
        Test updating user info via PATCH
        """
        url = reverse("user_detail")
        payload = {"first_name": "UpdatedName", "email": "updated@example.com"}
        response = self.client.patch(url, payload, format="json", **self.auth_header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["first_name"], "UpdatedName")
        self.assertEqual(response.data["email"], "updated@example.com")

    def test_change_password(self):
        """
        Test the change_password endpoint
        """
        change_password_url = reverse(
            "change_password"
        )  # e.g. path("change-password/", change_password, name="change_password")
        payload = {
            "current_password": "StrongP@ss123",
            "new_password": "NewStr0ngPass1",
        }
        response = self.client.post(
            change_password_url, payload, format="json", **self.auth_header
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("Password changed successfully!", response.data["message"])

        # Try logging in with the new password
        login_url = reverse("login")
        login_response = self.client.post(
            login_url,
            {"email": "testuser@example.com", "password": "NewStr0ngPass1"},
            format="json",
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn("access", login_response.data)

    def test_change_password_weak_password(self):
        """
        Try changing password to a weak one. Expect 400 + 'Password not strong enough' error.
        """
        change_password_url = reverse("change_password")
        # current password is correct, but new password is too weak
        payload = {"current_password": "StrongP@ss123", "new_password": "abc"}
        response = self.client.post(
            change_password_url, payload, format="json", **self.auth_header
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)
        self.assertIn("strong enough", response.data["error"])

    def test_patch_account_invalid_email(self):
        """
        Test that invalid email in patch triggers a 400
        """
        url = reverse("user_detail")
        payload = {"email": "not-an-email"}
        response = self.client.patch(url, payload, format="json", **self.auth_header)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)  # or check the exact message
