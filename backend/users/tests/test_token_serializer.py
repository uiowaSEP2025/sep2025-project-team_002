import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from users.models import Users
from unittest.mock import patch, MagicMock
from rest_framework_simplejwt.exceptions import AuthenticationFailed, TokenError
from users.views import CustomTokenObtainPairSerializer


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
class TestCustomTokenSerializer:
    def test_token_serializer_includes_user_data(self, api_client, create_user):
        """Test that the token serializer includes user data in the response"""
        user = create_user(first_name="John", last_name="Doe")
        # Set profile picture after creation
        user.profile_picture = "pic2.png"
        user.save()

        login_url = reverse("login")
        response = api_client.post(
            login_url,
            {"email": "test@example.com", "password": "StrongP@ss123"},
            format="json",
        )

        # Assert the response includes user data
        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data
        assert "refresh" in response.data
        assert response.data["first_name"] == "John"
        assert response.data["last_name"] == "Doe"
        assert response.data["profile_picture"] == "pic2.png"

    def test_token_serializer_authentication_failed(self, api_client, create_user):
        """Test that the token serializer handles AuthenticationFailed exceptions"""
        user = create_user()

        # Mock the validate method to raise AuthenticationFailed
        with patch.object(
            CustomTokenObtainPairSerializer,
            "validate",
            side_effect=AuthenticationFailed(
                "Invalid email or password. Please try again."
            ),
        ):
            login_url = reverse("login")
            response = api_client.post(
                login_url,
                {"email": "test@example.com", "password": "WrongPassword"},
                format="json",
            )

            # Assert the response indicates authentication failed
            assert response.status_code == status.HTTP_401_UNAUTHORIZED
            assert "Invalid email or password" in response.data["detail"]

    def test_token_serializer_token_error(self, api_client, create_user):
        """Test that the token serializer handles TokenError exceptions"""
        user = create_user()

        # Mock the validate method to raise TokenError
        with patch.object(
            CustomTokenObtainPairSerializer,
            "validate",
            side_effect=TokenError("Invalid token or credentials."),
        ):
            login_url = reverse("login")
            response = api_client.post(
                login_url,
                {"email": "test@example.com", "password": "StrongP@ss123"},
                format="json",
            )

            # Assert the response indicates token error
            assert response.status_code == status.HTTP_401_UNAUTHORIZED
            assert "Invalid token or credentials" in response.data["detail"]
