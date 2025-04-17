import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from users.models import Users
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from users.tokens import school_email_token_generator
from unittest.mock import patch


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def create_user(django_user_model):
    def make_user(**kwargs):
        defaults = {
            "email": "test@example.edu",
            "first_name": "Test",
            "last_name": "User",
            "password": "StrongP@ss123",
        }
        defaults.update(kwargs)
        return django_user_model.objects.create_user(**defaults)
    return make_user


@pytest.mark.django_db
class TestSchoolEmailVerification:
    def test_send_school_verification_success(self, api_client, create_user):
        """Test successful school email verification request"""
        user = create_user()

        # Get JWT tokens by logging in
        login_url = reverse("login")
        login_response = api_client.post(
            login_url,
            {"email": "test@example.edu", "password": "StrongP@ss123"},
            format="json"
        )
        access_token = login_response.data["access"]

        # Set up authentication header
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

        url = reverse("send_school_verification")

        # Mock the send_mail function
        with patch("users.views.send_mail") as mock_send_mail:
            response = api_client.post(url, format="json")

            # Assert the response is correct
            assert response.status_code == status.HTTP_200_OK
            assert response.data["message"] == "Verification email sent!"

            # Assert send_mail was called
            mock_send_mail.assert_called_once()

    def test_send_school_verification_non_edu_email(self, api_client, create_user):
        """Test school email verification with non .edu email"""
        user = create_user(email="test@example.com")

        # Get JWT tokens by logging in
        login_url = reverse("login")
        login_response = api_client.post(
            login_url,
            {"email": "test@example.com", "password": "StrongP@ss123"},
            format="json"
        )
        access_token = login_response.data["access"]

        # Set up authentication header
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

        url = reverse("send_school_verification")

        response = api_client.post(url, format="json")

        # Assert the response indicates a bad request
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Only .edu emails can be verified" in response.data["error"]

    def test_verify_school_email_success(self, api_client, create_user):
        """Test successful school email verification"""
        user = create_user()
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = school_email_token_generator.make_token(user)

        url = reverse("verify_school_email")
        data = {
            "uid": uid,
            "token": token
        }

        response = api_client.post(url, data, format="json")

        # Assert the response is correct
        assert response.status_code == status.HTTP_200_OK
        assert response.data["message"] == "School email verified successfully!"

        # Verify the user's school verification status was updated
        user.refresh_from_db()
        assert user.is_school_verified is True

    def test_verify_school_email_invalid_token(self, api_client, create_user):
        """Test school email verification with invalid token"""
        user = create_user()
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        url = reverse("verify_school_email")
        data = {
            "uid": uid,
            "token": "invalid-token"
        }

        response = api_client.post(url, data, format="json")

        # Assert the response indicates a bad request
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Verification link is expired or invalid" in response.data["error"]

    def test_verify_school_email_invalid_uid(self, api_client):
        """Test school email verification with invalid uid"""
        url = reverse("verify_school_email")
        data = {
            "uid": "invalid-uid",
            "token": "some-token"
        }

        response = api_client.post(url, data, format="json")

        # Assert the response indicates a bad request
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Invalid verification link" in response.data["error"]
