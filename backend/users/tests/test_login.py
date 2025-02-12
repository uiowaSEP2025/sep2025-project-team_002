import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def create_user():
    def make_user(**kwargs):
        return User.objects.create_user(**kwargs)

    return make_user


@pytest.mark.django_db
def test_login_successful(api_client, create_user):
    user = create_user(
        email="test@example.com",
        first_name="Test",
        last_name="User",
        password="testpassword123",
    )

    login_data = {"email": "test@example.com", "password": "testpassword123"}

    url = reverse("login")
    response = api_client.post(url, data=login_data, format="json")

    assert response.status_code == status.HTTP_200_OK
    assert "access" in response.data
    assert "refresh" in response.data


@pytest.mark.django_db
def test_login_invalid_credentials(api_client, create_user):
    user = create_user(
        email="test@example.com",
        first_name="Test",
        last_name="User",
        password="testpassword123",
    )

    login_data = {"email": "test@example.com", "password": "wrongpassword"}

    url = reverse("login")
    response = api_client.post(url, data=login_data, format="json")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "detail" in response.data
    assert (
        response.data["detail"] == "No active account found with the given credentials"
    )


@pytest.mark.django_db
def test_login_missing_fields(api_client):
    login_data = {"email": "test@example.com"}

    url = reverse("login")
    response = api_client.post(url, data=login_data, format="json")

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "password" in response.data
