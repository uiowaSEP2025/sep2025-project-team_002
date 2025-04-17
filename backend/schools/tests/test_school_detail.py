import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from schools.models import Schools
from reviews.models import Reviews
from django.utils import timezone


@pytest.mark.django_db
class TestSchoolDetail:
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
        def _create_school(name, mbb=False, wbb=False, fb=False):
            return Schools.objects.create(
                school_name=name,
                mbb=mbb,
                wbb=wbb,
                fb=fb,
                conference="Test Conference",
                location="Test Location",
            )

        return _create_school

    @pytest.fixture
    def create_review(self, django_user_model):
        def _create_review(school, coach_name, sport, ratings):
            email = f"{coach_name.lower().replace(' ', '')}@example.com"
            # Use get_or_create to avoid duplicate email issues
            user, _ = django_user_model.objects.get_or_create(
                email=email,
                defaults={
                    "first_name": "Test",
                    "last_name": "User",
                    "password": "password123",
                },
            )
            return Reviews.objects.create(
                school=school,
                user=user,
                sport=sport,
                head_coach_name=coach_name,
                review_message="Test review",
                head_coach=ratings.get("head_coach", 5),
                assistant_coaches=ratings.get("assistant_coaches", 5),
                team_culture=ratings.get("team_culture", 5),
                campus_life=ratings.get("campus_life", 5),
                athletic_facilities=ratings.get("athletic_facilities", 5),
                athletic_department=ratings.get("athletic_department", 5),
                player_development=ratings.get("player_development", 5),
                nil_opportunity=ratings.get("nil_opportunity", 5),
                created_at=timezone.now(),
            )

        return _create_review

    def test_get_school_detail_success(self, api_client, create_school, create_review):
        """Test successfully retrieving school details"""
        school = create_school("Test University", mbb=True, wbb=True, fb=True)

        # Create reviews for the school
        create_review(school, "Coach A", "Men's Basketball", {"head_coach": 8})
        create_review(school, "Coach B", "Women's Basketball", {"head_coach": 7})
        create_review(school, "Coach C", "Football", {"head_coach": 9})

        url = reverse("public-school-detail", kwargs={"pk": school.id})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["school_name"] == "Test University"
        assert response.data["conference"] == "Test Conference"
        assert response.data["location"] == "Test Location"
        assert response.data["mbb"] is True
        assert response.data["wbb"] is True
        assert response.data["fb"] is True

        # Check that reviews are included
        assert "reviews" in response.data
        assert len(response.data["reviews"]) == 3

    def test_get_school_detail_not_found(self, api_client):
        """Test retrieving details for a non-existent school"""
        url = reverse("public-school-detail", kwargs={"pk": 9999})  # Non-existent ID
        response = api_client.get(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_get_school_detail_with_sport_filter(self, api_client, create_school, create_review):
        """Test retrieving school details with sport filter"""
        school = create_school("Test University", mbb=True, wbb=True, fb=True)

        # Create reviews for different sports
        create_review(school, "Coach A", "Men's Basketball", {"head_coach": 8})
        create_review(school, "Coach B", "Women's Basketball", {"head_coach": 7})
        create_review(school, "Coach C", "Football", {"head_coach": 9})

        # Get details with sport filter
        url = reverse("public-school-detail", kwargs={"pk": school.id})
        response = api_client.get(url + "?sport=Men's Basketball")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["school_name"] == "Test University"

        # Check that all reviews are included (sport filter doesn't filter reviews in the current implementation)
        assert "reviews" in response.data
        assert len(response.data["reviews"]) == 3

    def test_get_school_detail_with_invalid_sport_filter(self, api_client, create_school, create_review):
        """Test retrieving school details with invalid sport filter"""
        school = create_school("Test University", mbb=True, wbb=True, fb=True)

        # Create reviews for different sports
        create_review(school, "Coach A", "Men's Basketball", {"head_coach": 8})
        create_review(school, "Coach B", "Women's Basketball", {"head_coach": 7})
        create_review(school, "Coach C", "Football", {"head_coach": 9})

        # Get details with invalid sport filter
        url = reverse("public-school-detail", kwargs={"pk": school.id})
        response = api_client.get(url + "?sport=InvalidSport")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["school_name"] == "Test University"

        # Check that all reviews are included since the sport filter is invalid
        assert "reviews" in response.data
        assert len(response.data["reviews"]) == 3
