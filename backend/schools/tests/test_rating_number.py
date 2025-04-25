import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from schools.models import Schools
from reviews.models import Reviews
from schools.serializers import SchoolSerializer
from django.utils import timezone
from unittest.mock import Mock

@pytest.mark.django_db
class TestSchoolSerializer:
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
        def _create_school(name="Test University", mbb=True, wbb=True, fb=True):
            return Schools.objects.create(
                school_name=name,
                conference="Test Conference",
                location="Test Location",
                mbb=mbb,
                wbb=wbb,
                fb=fb,
            )

        return _create_school

    @pytest.fixture
    def mock_request(self, create_user):
        user = create_user()
        request = Mock()
        request.user = user
        return request

    @pytest.fixture
    def create_review(self, create_user):
        def _create_review(school, user=None, sport="mbb", **ratings):
            if user is None:
                import uuid

                unique_id = uuid.uuid4().hex[:8]
                user = create_user(email=f"reviewer_{sport}_{unique_id}@example.com")

            default_ratings = {
                "head_coach": 8,
                "assistant_coaches": 7,
                "team_culture": 9,
                "campus_life": 8,
                "athletic_facilities": 7,
                "athletic_department": 8,
                "player_development": 9,
                "nil_opportunity": 7,
            }
            default_ratings.update(ratings)

            return Reviews.objects.create(
                school=school,
                user=user,
                sport=sport,
                head_coach_name="Test Coach",
                review_message="This is a test review.",
                created_at=timezone.now(),
                **default_ratings,
            )

        return _create_review

    def test_review_count_field(self, create_school, create_review, mock_request):
        """Test that the review_count field returns the correct count of reviews"""
        school = create_school()

        # Create 3 reviews for the school
        create_review(school, sport="mbb")
        create_review(school, sport="wbb")
        create_review(school, sport="fb")

        serializer = SchoolSerializer(school, context={"request": mock_request})

        # Check that review_count is 3
        assert serializer.data["review_count"] == 3

    def test_review_count_zero(self, create_school, mock_request):
        """Test that review_count is 0 when there are no reviews"""
        school = create_school()

        serializer = SchoolSerializer(school, context={"request": mock_request})

        # Check that review_count is 0
        assert serializer.data["review_count"] == 0

    def test_average_rating_calculation(self, create_school, create_review, mock_request):
        """Test that the average_rating field calculates the correct average"""
        school = create_school()

        # Create a review with specific ratings
        create_review(
            school,
            sport="mbb",
            head_coach=10,
            assistant_coaches=8,
            team_culture=6,
            campus_life=4,
            athletic_facilities=2,
            athletic_department=10,
            player_development=8,
            nil_opportunity=6,
        )

        serializer = SchoolSerializer(school, context={"request": mock_request})

        # The average should be (10+8+6+4+2+10+8+6)/8 = 54/8 = 6.75, rounded to 6.8
        assert serializer.data["average_rating"] == 6.8

    def test_average_rating_multiple_reviews(self, create_school, create_review, mock_request):
        """Test that average_rating correctly averages across multiple reviews"""
        school = create_school()

        # Create two reviews with different ratings
        create_review(
            school,
            sport="mbb",
            head_coach=10,
            assistant_coaches=10,
            team_culture=10,
            campus_life=10,
            athletic_facilities=10,
            athletic_department=10,
            player_development=10,
            nil_opportunity=10,
        )

        create_review(
            school,
            sport="wbb",
            head_coach=5,
            assistant_coaches=5,
            team_culture=5,
            campus_life=5,
            athletic_facilities=5,
            athletic_department=5,
            player_development=5,
            nil_opportunity=5,
        )

        serializer = SchoolSerializer(school, context={"request": mock_request})

        # First review average: 10
        # Second review average: 5
        # Overall average: (10+5)/2 = 7.5
        assert serializer.data["average_rating"] == 7.5

    def test_average_rating_zero(self, create_school, mock_request):
        """Test that average_rating is 0 when there are no reviews"""
        school = create_school()

        serializer = SchoolSerializer(school, context={"request": mock_request})

        # Check that average_rating is 0
        assert serializer.data["average_rating"] == 0

    def test_serializer_includes_all_fields(self, create_school, create_review, mock_request):
        """Test that the serializer includes all expected fields"""
        school = create_school()
        create_review(school)

        serializer = SchoolSerializer(school, context={"request": mock_request})

        # Check that all expected fields are present
        expected_fields = [
            "id",
            "school_name",
            "mbb",
            "wbb",
            "fb",
            "conference",
            "location",
            "available_sports",
            "reviews",
            "review_count",
            "average_rating",
        ]

        for field in expected_fields:
            assert field in serializer.data
