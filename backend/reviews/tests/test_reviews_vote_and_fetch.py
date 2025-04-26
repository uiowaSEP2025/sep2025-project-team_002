import pytest
from unittest.mock import patch
from rest_framework import status
from rest_framework.test import APIClient
from schools.models import Schools
from reviews.models import Reviews, ReviewVote


@pytest.mark.django_db
class TestReviewVotesAndFetching:
    @pytest.fixture
    def api_client(self):
        return APIClient()

    @pytest.fixture
    def create_user(self, django_user_model):
        def make_user(**kwargs):
            return django_user_model.objects.create_user(**kwargs)

        return make_user

    @pytest.fixture
    def create_school(self):
        return Schools.objects.create(
            school_name="Test University",
            mbb=True,
            wbb=False,
            fb=False,
            conference="Test Conference",
            location="The Moon",
        )

    @pytest.fixture
    def auth_client(self, api_client, create_user):
        user = create_user(
            email="testuser@example.com",
            first_name="Billy",
            last_name="Bob",
            password="password123",
        )
        api_client.force_authenticate(user=user)
        return api_client, user

    @pytest.fixture
    def create_review(self, create_school, create_user):
        user = create_user(
            email="reviewer@example.com",
            first_name="Alice",
            last_name="Smith",
            password="password123",
        )
        return Reviews.objects.create(
            school=create_school,
            user=user,
            sport="Men's Basketball",
            head_coach_name="John Doe",
            review_message="Pretty good!",
            head_coach=4,
            assistant_coaches=4,
            team_culture=5,
            campus_life=5,
            athletic_facilities=5,
            athletic_department=5,
            player_development=5,
            nil_opportunity=3,
        )

    def test_vote_create_and_toggle(self, auth_client, create_review):
        client, user = auth_client

        # First vote (helpful)
        response = client.post(
            f"/api/reviews/{create_review.review_id}/vote/", {"vote": 1}
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["vote"] == 1
        assert ReviewVote.objects.filter(
            review=create_review, user=user, vote=1
        ).exists()

        # Vote again with the same value (should cancel vote)
        response = client.post(
            f"/api/reviews/{create_review.review_id}/vote/", {"vote": 1}
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["vote"] is None
        assert ReviewVote.objects.filter(review=create_review, user=user).count() == 0

    def test_invalid_vote_value(self, auth_client, create_review):
        client, _ = auth_client

        response = client.post(
            f"/api/reviews/{create_review.review_id}/vote/", {"vote": 2}
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "detail" in response.data

    @patch("reviews.views.CoachSearchService")
    def test_get_school_reviews_success(
        self, mock_coach_service, auth_client, create_school, create_review
    ):
        client, _ = auth_client

        mock_instance = mock_coach_service.return_value
        mock_instance.search_coach_history.return_value = (
            "2010-2020 @Test University",
            None,
        )
        mock_instance._normalize_name.return_value = "test university"

        response = client.get(
            f"/api/reviews/school/{create_school.id}/?sport=Men's Basketball"
        )

        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        assert isinstance(body, list)
        assert len(body) > 0
        assert body[0]["head_coach_name"] == "John Doe"
        assert body[0]["is_no_longer_at_school"] is False

    def test_get_school_reviews_missing_sport(self, auth_client, create_school):
        client, _ = auth_client

        response = client.get(f"/api/reviews/school/{create_school.id}/")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "error" in response.json()

    def test_get_school_reviews_school_not_found(self, auth_client):
        client, _ = auth_client

        response = client.get("/api/reviews/school/9999/?sport=Men's Basketball")
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "error" in response.json()
