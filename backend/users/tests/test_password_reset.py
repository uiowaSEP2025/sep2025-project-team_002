import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from users.models import Users
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from unittest.mock import patch


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def create_user(django_user_model):
    def make_user(**kwargs):
        defaults = {
            "email": "test@example.com",
            "first_name": "Test",
            "last_name": "User",
            "password": "StrongP@ss123",
        }
        defaults.update(kwargs)
        return django_user_model.objects.create_user(**defaults)

    return make_user


@pytest.mark.django_db
class TestForgotPassword:
    def test_forgot_password_success(self, api_client, create_user):
        """Test successful password reset request"""
        user = create_user()
        url = reverse("forgot_password")
        data = {"email": "test@example.com"}

        # Mock the send_mail function
        with patch("users.views.send_mail") as mock_send_mail:
            response = api_client.post(url, data, format="json")

            # Assert the response is correct
            assert response.status_code == status.HTTP_200_OK
            assert response.data["message"] == "An email has been sent!"

            # Assert send_mail was called
            mock_send_mail.assert_called_once()

    def test_forgot_password_unregistered_email(self, api_client):
        """Test password reset with unregistered email"""
        url = reverse("forgot_password")
        data = {"email": "nonexistent@example.com"}

        response = api_client.post(url, data, format="json")

        # Assert the response indicates a bad request
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Unregistered Email Address!" in response.data["error"]

    def test_forgot_password_missing_email(self, api_client):
        """Test password reset with missing email"""
        url = reverse("forgot_password")
        data = {}

        response = api_client.post(url, data, format="json")

        # Assert the response indicates a bad request
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Email is required" in response.data["error"]


@pytest.mark.django_db
class TestResetPassword:
    def test_reset_password_success(self, api_client, create_user):
        """Test successful password reset"""
        user = create_user()
        token_generator = PasswordResetTokenGenerator()
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = token_generator.make_token(user)

        url = reverse("reset_password")
        data = {
            "uid": uid,
            "token": token,
            "new_password": "NewStrongP@ss123",
            "confirm_password": "NewStrongP@ss123",
        }

        response = api_client.post(url, data, format="json")

        # Assert the response is correct
        assert response.status_code == status.HTTP_200_OK
        assert response.data["message"] == "Successfully reset the password!"

        # Verify the password was actually changed
        user.refresh_from_db()
        assert user.check_password("NewStrongP@ss123")

    def test_reset_password_invalid_token(self, api_client, create_user):
        """Test password reset with invalid token"""
        user = create_user()
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        url = reverse("reset_password")
        data = {
            "uid": uid,
            "token": "invalid-token",
            "new_password": "NewStrongP@ss123",
            "confirm_password": "NewStrongP@ss123",
        }

        response = api_client.post(url, data, format="json")

        # Assert the response indicates a bad request
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Link is invalid or expired!" in response.data["error"]

    def test_reset_password_invalid_uid(self, api_client):
        """Test password reset with invalid uid"""
        url = reverse("reset_password")
        data = {
            "uid": "invalid-uid",
            "token": "some-token",
            "new_password": "NewStrongP@ss123",
            "confirm_password": "NewStrongP@ss123",
        }

        response = api_client.post(url, data, format="json")

        # Assert the response indicates a bad request
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Invalid Link!" in response.data["error"]

    def test_reset_password_passwords_dont_match(self, api_client, create_user):
        """Test password reset with mismatched passwords"""
        user = create_user()
        token_generator = PasswordResetTokenGenerator()
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = token_generator.make_token(user)

        url = reverse("reset_password")
        data = {
            "uid": uid,
            "token": token,
            "new_password": "NewStrongP@ss123",
            "confirm_password": "DifferentP@ss123",
        }

        response = api_client.post(url, data, format="json")

        # Assert the response indicates a bad request
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Passwords don't match" in response.data["error"]

    def test_reset_password_weak_password(self, api_client, create_user):
        """Test password reset with weak password"""
        user = create_user()
        token_generator = PasswordResetTokenGenerator()
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = token_generator.make_token(user)

        url = reverse("reset_password")
        data = {
            "uid": uid,
            "token": token,
            "new_password": "weak",
            "confirm_password": "weak",
        }

        response = api_client.post(url, data, format="json")

        # Assert the response indicates a bad request
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Use Strong Password!" in response.data["error"]

    def test_reset_password_missing_fields(self, api_client):
        """Test password reset with missing fields"""
        url = reverse("reset_password")
        data = {
            "uid": "some-uid",
            "token": "some-token",
            # Missing password fields
        }

        response = api_client.post(url, data, format="json")

        # Assert the response indicates a bad request
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Please Fill Out the Form!" in response.data["error"]
