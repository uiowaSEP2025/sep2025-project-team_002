import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from schools.models import Schools
from reviews.models import Reviews
from django.utils import timezone


@pytest.mark.django_db
class TestFilterBySport:
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

    def test_filter_by_sport_mens_basketball(
        self, api_client, create_school, create_review
    ):
        """Test filtering schools by Men's Basketball sport"""
        # Create schools with different sports
        school1 = create_school("MBB School", mbb=True)
        school2 = create_school("WBB School", wbb=True)
        school3 = create_school("FB School", fb=True)

        # Create reviews for each school with the corresponding sport
        create_review(school1, "Coach MBB", "mbb", {"head_coach": 7})
        create_review(school2, "Coach WBB", "wbb", {"head_coach": 8})
        create_review(school3, "Coach FB", "fb", {"head_coach": 9})

        url = reverse("filter-schools")
        response = api_client.get(url + "?sport=Men's Basketball")

        assert response.status_code == status.HTTP_200_OK
        returned_school_names = [school["school_name"] for school in response.data]
        assert "MBB School" in returned_school_names
        assert "WBB School" not in returned_school_names
        assert "FB School" not in returned_school_names

    def test_filter_by_sport_womens_basketball(
        self, api_client, create_school, create_review
    ):
        """Test filtering schools by Women's Basketball sport"""
        # Create schools with different sports
        school1 = create_school("MBB School", mbb=True)
        school2 = create_school("WBB School", wbb=True)
        school3 = create_school("FB School", fb=True)

        # Create reviews for each school with the corresponding sport
        create_review(school1, "Coach MBB", "mbb", {"head_coach": 7})
        create_review(school2, "Coach WBB", "wbb", {"head_coach": 8})
        create_review(school3, "Coach FB", "fb", {"head_coach": 9})

        url = reverse("filter-schools")
        response = api_client.get(url + "?sport=Women's Basketball")

        assert response.status_code == status.HTTP_200_OK
        returned_school_names = [school["school_name"] for school in response.data]
        assert "MBB School" not in returned_school_names
        assert "WBB School" in returned_school_names
        assert "FB School" not in returned_school_names

    def test_filter_by_sport_football(self, api_client, create_school, create_review):
        """Test filtering schools by Football sport"""
        # Create schools with different sports
        school1 = create_school("MBB School", mbb=True)
        school2 = create_school("WBB School", wbb=True)
        school3 = create_school("FB School", fb=True)

        # Create reviews for each school with the corresponding sport
        create_review(school1, "Coach MBB", "mbb", {"head_coach": 7})
        create_review(school2, "Coach WBB", "wbb", {"head_coach": 8})
        create_review(school3, "Coach FB", "fb", {"head_coach": 9})

        url = reverse("filter-schools")
        response = api_client.get(url + "?sport=Football")

        assert response.status_code == status.HTTP_200_OK
        returned_school_names = [school["school_name"] for school in response.data]
        assert "MBB School" not in returned_school_names
        assert "WBB School" not in returned_school_names
        assert "FB School" in returned_school_names

    def test_filter_by_sport_and_rating(self, api_client, create_school, create_review):
        """Test filtering schools by sport and rating"""
        # Create schools with the same sport but different ratings
        school1 = create_school("Low Rating School", fb=True)
        school2 = create_school("Medium Rating School", fb=True)
        school3 = create_school("High Rating School", fb=True)

        # Create reviews with different ratings
        create_review(school1, "Coach Low", "fb", {"head_coach": 5})
        create_review(school2, "Coach Medium", "fb", {"head_coach": 7})
        create_review(school3, "Coach High", "fb", {"head_coach": 9})

        url = reverse("filter-schools")
        response = api_client.get(url + "?sport=Football&head_coach=7")

        assert response.status_code == status.HTTP_200_OK
        returned_school_names = [school["school_name"] for school in response.data]
        assert "Low Rating School" not in returned_school_names
        assert "Medium Rating School" in returned_school_names
        assert "High Rating School" in returned_school_names

    def test_filter_by_invalid_sport(self, api_client, create_school, create_review):
        """Test filtering by an invalid sport"""
        # Create schools with different sports
        school1 = create_school("MBB School", mbb=True)
        school2 = create_school("WBB School", wbb=True)
        school3 = create_school("FB School", fb=True)

        # Create reviews for each school
        create_review(school1, "Coach MBB", "mbb", {"head_coach": 7})
        create_review(school2, "Coach WBB", "wbb", {"head_coach": 8})
        create_review(school3, "Coach FB", "fb", {"head_coach": 9})

        url = reverse("filter-schools")
        response = api_client.get(url + "?sport=InvalidSport")

        # The current implementation returns an empty list for invalid sports
        assert response.status_code == status.HTTP_200_OK
        returned_school_names = [school["school_name"] for school in response.data]
        assert (
            len(returned_school_names) == 0
        )  # No schools are returned for invalid sport
