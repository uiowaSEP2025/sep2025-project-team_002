import pytest
from rest_framework.test import APIClient
from rest_framework import status
from preferences.models import Preferences


@pytest.mark.django_db
class TestPreferencesAPI:
    @pytest.fixture
    def api_client(self):
        return APIClient()

    @pytest.fixture
    def create_user(self, django_user_model):
        def make_user(**kwargs):
            return django_user_model.objects.create_user(**kwargs)

        return make_user

    @pytest.fixture
    def auth_client(self, api_client, create_user):
        """Returns an authenticated client and user instance."""
        user = create_user(
            email="testuser@example.com",
            first_name="Billy",
            last_name="Bob",
            password="password123",
        )
        api_client.force_authenticate(user=user)
        return api_client, user

    def test_create_preference_success(self, auth_client):
        """Test successful creation of a preference."""
        client, user = auth_client
        data = {
            "sport": "Basketball",
            "head_coach": 5,
            "assistant_coaches": 4,
            "team_culture": 3,
            "campus_life": 4,
            "athletic_facilities": 5,
            "athletic_department": 2,
            "player_development": 5,
            "nil_opportunity": 3,
        }

        response = client.post(
            "/api/preferences/preferences-form/", data, format="json"
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert Preferences.objects.count() == 1
        preference = Preferences.objects.first()
        assert preference.user == user
        assert preference.sport == "Basketball"

    def test_create_preference_missing_fields_fail(self, auth_client):
        """Test creating a preference with missing required fields (should fail)."""
        client, user = auth_client
        data = {
            "sport": "Soccer",
            # Missing required integer fields
        }

        response = client.post(
            "/api/preferences/preferences-form/", data, format="json"
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert Preferences.objects.count() == 0  # No preference should be created

    def test_user_preferences_authenticated(self, auth_client):
        """Test that an authenticated user can retrieve only their preferences."""
        client, user = auth_client

        Preferences.objects.create(
            user=user,
            sport="Football",
            head_coach=4,
            assistant_coaches=3,
            team_culture=5,
            campus_life=4,
            athletic_facilities=5,
            athletic_department=3,
            player_development=4,
            nil_opportunity=2,
        )

        response = client.get("/api/preferences/user-preferences/")

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["sport"] == "Football"
        assert response.data[0]["user"] == user.id

    def test_user_cannot_access_others_preferences(self, auth_client, create_user):
        """Test that a user cannot see another user's preferences."""
        client, user = auth_client
        other_user = create_user(
            email="otheruser@example.com",
            first_name="Jane",
            last_name="Doe",
            password="password123",
        )

        Preferences.objects.create(
            user=other_user,
            sport="Soccer",
            head_coach=3,
            assistant_coaches=4,
            team_culture=3,
            campus_life=5,
            athletic_facilities=4,
            athletic_department=5,
            player_development=2,
            nil_opportunity=3,
        )

        response = client.get("/api/preferences/user-preferences/")

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 0  # User should not see others' preferences
