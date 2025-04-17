import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from schools.models import Schools
from reviews.models import Reviews
from preferences.models import Preferences
from django.utils import timezone
from unittest.mock import patch


@pytest.mark.django_db
class TestRecommendations:
    @pytest.fixture
    def api_client(self):
        return APIClient()

    @pytest.fixture
    def create_user(self, django_user_model):
        def make_user(**kwargs):
            defaults = {
                "email": "test@example.com",
                "first_name": "Test",
                "last_name": "User",
                "password": "password123",
            }
            defaults.update(kwargs)
            return django_user_model.objects.create_user(**defaults)
        return make_user

    @pytest.fixture
    def create_school(self):
        def _create_school(name, mbb=False, wbb=False, fb=False, **kwargs):
            defaults = {
                "conference": "Test Conference",
                "location": "Test Location",
            }
            defaults.update(kwargs)
            return Schools.objects.create(
                school_name=name,
                mbb=mbb,
                wbb=wbb,
                fb=fb,
                **defaults
            )
        return _create_school

    @pytest.fixture
    def create_review(self, create_user):
        def _create_review(school, sport, ratings):
            # Use a unique email for each review to avoid conflicts
            import uuid
            unique_id = uuid.uuid4().hex[:8]
            user = create_user(email=f"reviewer_{sport}_{unique_id}@example.com")
            return Reviews.objects.create(
                school=school,
                user=user,
                sport=sport,
                head_coach_name="Test Coach",
                review_message="This is a test review.",
                head_coach=ratings.get("head_coach", 5),
                assistant_coaches=ratings.get("assistant_coaches", 5),
                team_culture=ratings.get("team_culture", 5),
                campus_life=ratings.get("campus_life", 5),
                athletic_facilities=ratings.get("athletic_facilities", 5),
                athletic_department=ratings.get("athletic_department", 5),
                player_development=ratings.get("player_development", 5),
                nil_opportunity=ratings.get("nil_opportunity", 5),
                created_at=timezone.now()
            )
        return _create_review

    @pytest.fixture
    def create_preferences(self, create_user):
        def _create_preferences(user=None, sport="mbb", **kwargs):
            if user is None:
                user = create_user()

            defaults = {
                "head_coach": 8,
                "assistant_coaches": 7,
                "team_culture": 9,
                "campus_life": 6,
                "athletic_facilities": 7,
                "athletic_department": 5,
                "player_development": 8,
                "nil_opportunity": 6
            }
            defaults.update(kwargs)

            return Preferences.objects.create(
                user=user,
                sport=sport,
                **defaults
            )
        return _create_preferences

    def test_get_recommendations_no_preferences(self, api_client, create_user):
        """Test recommendations when user has no preferences"""
        user = create_user()

        # Get JWT tokens by logging in
        login_url = reverse("login")
        login_response = api_client.post(
            login_url,
            {"email": "test@example.com", "password": "password123"},
            format="json"
        )
        access_token = login_response.data["access"]

        # Set up authentication header
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

        url = reverse("recommended-schools")
        response = api_client.get(url)

        # Assert the response indicates no preferences
        assert response.status_code == status.HTTP_200_OK
        assert response.data["no_preferences"] is True

    def test_get_recommendations_with_preferences(self, api_client, create_user, create_school, create_review, create_preferences):
        """Test recommendations when user has preferences"""
        user = create_user()

        # Create schools with different sports
        school1 = create_school("MBB School 1", mbb=True)
        school2 = create_school("MBB School 2", mbb=True)
        school3 = create_school("MBB School 3", mbb=True)

        # Create reviews with different ratings
        create_review(school1, "mbb", {
            "head_coach": 9,
            "assistant_coaches": 8,
            "team_culture": 9,
            "campus_life": 7,
            "athletic_facilities": 8,
            "athletic_department": 6,
            "player_development": 9,
            "nil_opportunity": 7
        })
        create_review(school2, "mbb", {
            "head_coach": 7,
            "assistant_coaches": 6,
            "team_culture": 7,
            "campus_life": 8,
            "athletic_facilities": 9,
            "athletic_department": 8,
            "player_development": 7,
            "nil_opportunity": 8
        })
        create_review(school3, "mbb", {
            "head_coach": 5,
            "assistant_coaches": 5,
            "team_culture": 6,
            "campus_life": 6,
            "athletic_facilities": 5,
            "athletic_department": 5,
            "player_development": 5,
            "nil_opportunity": 5
        })

        # Create user preferences
        preferences = create_preferences(user, "mbb",
            head_coach=9,
            assistant_coaches=8,
            team_culture=9,
            campus_life=7,
            athletic_facilities=8,
            athletic_department=6,
            player_development=9,
            nil_opportunity=7
        )

        # Get JWT tokens by logging in
        login_url = reverse("login")
        login_response = api_client.post(
            login_url,
            {"email": "test@example.com", "password": "password123"},
            format="json"
        )
        access_token = login_response.data["access"]

        # Set up authentication header
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

        url = reverse("recommended-schools")
        response = api_client.get(url)

        # Assert the response contains recommendations
        assert response.status_code == status.HTTP_200_OK
        # The API returns a list directly, not wrapped in a "recommendations" key
        assert isinstance(response.data, list)
        assert len(response.data) > 0

        # School1 should be ranked higher than School2 and School3
        # The response contains a 'school' key with the school data
        school_ranks = {school["school"]["school_name"]: i for i, school in enumerate(response.data)}
        if "MBB School 1" in school_ranks and "MBB School 3" in school_ranks:
            assert school_ranks["MBB School 1"] < school_ranks["MBB School 3"]

    def test_get_recommendations_no_matching_schools(self, api_client, create_user, create_preferences):
        """Test recommendations when there are no schools matching the user's preferred sport"""
        user = create_user()

        # Create user preferences for a sport with no schools
        preferences = create_preferences(user, "mbb")

        # Get JWT tokens by logging in
        login_url = reverse("login")
        login_response = api_client.post(
            login_url,
            {"email": "test@example.com", "password": "password123"},
            format="json"
        )
        access_token = login_response.data["access"]

        # Set up authentication header
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

        url = reverse("recommended-schools")
        response = api_client.get(url)

        # Assert the response contains empty recommendations
        assert response.status_code == status.HTTP_200_OK
        # The API returns a list directly, not wrapped in a "recommendations" key
        assert isinstance(response.data, list)
        assert len(response.data) == 0

    def test_get_recommendations_unauthorized(self, api_client):
        """Test recommendations without authentication"""
        url = reverse("recommended-schools")
        response = api_client.get(url)

        # Assert the response indicates unauthorized
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
