import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from users.models import Users


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
            "password": "StrongP@ss123"
        }
        defaults.update(kwargs)
        return django_user_model.objects.create_user(**defaults)
    return make_user


@pytest.mark.django_db
class TestProfilePictureUpdate:
    def test_update_profile_picture_success(self, api_client, create_user):
        """Test successful profile picture update"""
        user = create_user()

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

        url = reverse("update-profile-picture")
        data = {"profile_picture": "pic2.png"}

        response = api_client.patch(url, data, format="json")

        # Assert the response is correct
        assert response.status_code == status.HTTP_200_OK
        assert response.data["message"] == "Profile picture updated"
        assert response.data["profile_picture"] == "pic2.png"

        # Verify the user's profile picture was updated
        user.refresh_from_db()
        assert user.profile_picture == "pic2.png"

    def test_update_profile_picture_missing_picture(self, api_client, create_user):
        """Test profile picture update with missing picture"""
        user = create_user()

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

        url = reverse("update-profile-picture")
        data = {}  # Missing profile_picture

        response = api_client.patch(url, data, format="json")

        # Assert the response indicates a bad request
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Profile picture is required" in response.data["error"]

    def test_update_profile_picture_invalid_choice(self, api_client, create_user):
        """Test profile picture update with invalid picture choice"""
        user = create_user()

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

        url = reverse("update-profile-picture")
        data = {"profile_picture": "invalid_picture"}  # Invalid choice

        response = api_client.patch(url, data, format="json")

        # Assert the response indicates a bad request
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Invalid profile picture choice" in response.data["error"]

    def test_update_profile_picture_unauthorized(self, api_client):
        """Test profile picture update without authentication"""
        url = reverse("update-profile-picture")
        data = {"profile_picture": "pic2.png"}

        response = api_client.patch(url, data, format="json")

        # Assert the response indicates unauthorized
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
