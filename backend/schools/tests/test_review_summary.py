import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from schools.models import Schools
from reviews.models import Reviews
from django.utils import timezone
from unittest.mock import patch, MagicMock


@pytest.mark.django_db
class TestReviewSummary:
    @pytest.fixture
    def api_client(self):
        return APIClient()

    @pytest.fixture
    def create_school(self):
        def _create_school(name):
            return Schools.objects.create(
                school_name=name,
                conference="Test Conference",
                location="Test Location",
                mbb=True,
                wbb=True,
                fb=True,
            )

        return _create_school

    @pytest.fixture
    def create_review(self, django_user_model):
        def _create_review(school, coach_name, sport, review_text):
            user = django_user_model.objects.create_user(
                email=f"{coach_name.lower().replace(' ', '')}@example.com",
                password="testpass123",
                first_name="Test",
                last_name="User",
            )
            return Reviews.objects.create(
                school=school,
                user=user,
                sport=sport,
                head_coach_name=coach_name,
                review_message=review_text,
                head_coach=5,
                assistant_coaches=5,
                team_culture=5,
                campus_life=5,
                athletic_facilities=5,
                athletic_department=5,
                player_development=5,
                nil_opportunity=5,
                created_at=timezone.now(),
            )

        return _create_review

    def test_get_review_summary_missing_sport(self, api_client, create_school):
        """Test getting review summary without sport parameter"""
        school = create_school("Test University")
        url = reverse("review-summary", args=[school.id])
        response = api_client.get(url)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["error"] == "Sport parameter is required"

    def test_get_review_summary_no_reviews(self, api_client, create_school):
        """Test getting review summary when no reviews exist"""
        school = create_school("Test University")
        url = reverse("review-summary", args=[school.id]) + "?sport=fb"
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert "No reviews available" in response.data["summary"]

    @patch("openai.OpenAI")
    def test_get_review_summary_with_reviews(
        self, mock_openai, api_client, create_school, create_review
    ):
        """Test getting review summary with existing reviews"""
        # Mock OpenAI responses
        mock_client = MagicMock()
        mock_openai.return_value = mock_client

        # Mock general summary response
        mock_general_response = MagicMock()
        mock_general_response.choices = [MagicMock()]
        mock_general_response.choices[0].message.content = "Test general summary"

        # Mock coach summary response
        mock_coach_response = MagicMock()
        mock_coach_response.choices = [MagicMock()]
        mock_coach_response.choices[0].message.content = "Test coach summary"

        mock_client.chat.completions.create.side_effect = [
            mock_general_response,
            mock_coach_response,
        ]

        # Create test data
        school = create_school("Test University")
        review = create_review(
            school,
            "John Smith",
            "fb",
            "Great facilities and team culture. The coach is excellent.",
        )

        url = reverse("review-summary", args=[school.id]) + "?sport=fb"
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert "summary" in response.data
        assert isinstance(response.data["summary"], str)

    @patch("openai.OpenAI")
    def test_get_review_summary_multiple_coaches(
        self, mock_openai, api_client, create_school, create_review
    ):
        """Test getting review summary with multiple coaches"""
        # Mock OpenAI responses
        mock_client = MagicMock()
        mock_openai.return_value = mock_client

        # Mock general summary response
        mock_general_response = MagicMock()
        mock_general_response.choices = [MagicMock()]
        mock_general_response.choices[0].message.content = "Test general summary"

        # Mock coach summary response
        mock_coach_response = MagicMock()
        mock_coach_response.choices = [MagicMock()]
        mock_coach_response.choices[0].message.content = "Test coach summary"

        mock_client.chat.completions.create.side_effect = [
            mock_general_response,
            mock_coach_response,
        ]

        # Create test data
        school = create_school("Test University")
        create_review(
            school,
            "John Smith",
            "fb",
            "Great facilities and team culture. The coach is excellent.",
        )
        create_review(
            school, "Jane Doe", "fb", "Excellent coaching staff and player development."
        )

        url = reverse("review-summary", args=[school.id]) + "?sport=fb"
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert "summary" in response.data
        assert isinstance(response.data["summary"], str)
        assert (
            "John Smith" in response.data["summary"]
            or "Jane Doe" in response.data["summary"]
        )
