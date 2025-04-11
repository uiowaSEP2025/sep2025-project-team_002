import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from schools.models import Schools
from reviews.models import Reviews
from django.utils import timezone


@pytest.mark.django_db
class TestFilterSchools:
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

    def test_filter_by_no_filters(self, api_client, create_school, create_review):
        school1 = create_school("School One", fb=True)
        school2 = create_school("School Two", fb=True)
        create_review(school1, "Coach A", "Football", {"head_coach": 7})
        create_review(school2, "Coach B", "Football", {"head_coach": 8})

        url = reverse("filter-schools")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        returned_school_names = [school["school_name"] for school in response.data]
        assert "School One" in returned_school_names
        assert "School Two" in returned_school_names

    def test_filter_by_coach(self, api_client, create_school, create_review):
        school1 = create_school("School One", fb=True)
        school2 = create_school("School Two", fb=True)
        create_review(school1, "Coach A", "Football", {"head_coach": 7})
        create_review(school2, "Coach B", "Football", {"head_coach": 8})

        url = reverse("filter-schools")
        response = api_client.get(url + "?coach=Coach A")
        assert response.status_code == status.HTTP_200_OK
        returned_school_names = [school["school_name"] for school in response.data]
        assert "School One" in returned_school_names
        assert "School Two" not in returned_school_names

    def test_filter_by_rating(self, api_client, create_school, create_review):
        school1 = create_school("School One", fb=True)
        school2 = create_school("School Two", fb=True)
        create_review(school1, "Coach A", "Football", {"head_coach": 7})
        create_review(school2, "Coach B", "Football", {"head_coach": 8})

        url = reverse("filter-schools")
        response = api_client.get(url + "?head_coach=8")
        assert response.status_code == status.HTTP_200_OK
        returned_school_names = [school["school_name"] for school in response.data]
        assert "School Two" in returned_school_names
        assert "School One" not in returned_school_names

    def test_filter_by_coach_and_rating(self, api_client, create_school, create_review):
        school1 = create_school("School One", fb=True)
        school2 = create_school("School Two", fb=True)
        create_review(school1, "Coach A", "Football", {"head_coach": 7})
        create_review(school2, "Coach A", "Football", {"head_coach": 8})

        url = reverse("filter-schools")
        response = api_client.get(url + "?coach=Coach A&head_coach=8")
        assert response.status_code == status.HTTP_200_OK
        returned_school_names = [school["school_name"] for school in response.data]
        assert "School Two" in returned_school_names
        assert "School One" not in returned_school_names

    def test_filter_invalid_rating_and_school_name(
        self, api_client, create_school, create_review
    ):
        """
        Test that an invalid rating value is ignored (raising ValueError internally)
        and that filtering by school_name works.
        """
        school1 = create_school("Alpha School", fb=True)
        school2 = create_school("Beta School", fb=True)
        create_review(school1, "Coach X", "Football", {"head_coach": 5})
        create_review(school2, "Coach Y", "Football", {"head_coach": 7})

        url = reverse("filter-schools")
        # Pass an invalid value for head_coach (non-numeric) and a school_name filter
        response = api_client.get(url + "?head_coach=abc&school_name=alpha")
        assert response.status_code == status.HTTP_200_OK
        returned_school_names = [school["school_name"] for school in response.data]
        # The invalid rating value should be ignored so that the filter by school_name is applied
        assert "Alpha School" in returned_school_names
        assert "Beta School" not in returned_school_names

    def test_filter_by_rating_greater_than_or_equal(self, api_client, create_school, create_review):
        """
        Test that filtering by rating returns schools with ratings greater than or equal to the specified value.
        """
        school1 = create_school("School Low", fb=True)
        school2 = create_school("School Medium", fb=True)
        school3 = create_school("School High", fb=True)

        # Create reviews with different ratings
        create_review(school1, "Coach A", "Football", {"head_coach": 5})
        create_review(school2, "Coach B", "Football", {"head_coach": 7})
        create_review(school3, "Coach C", "Football", {"head_coach": 9})

        # Filter by head_coach rating = 7
        url = reverse("filter-schools")
        response = api_client.get(url + "?head_coach=7")
        assert response.status_code == status.HTTP_200_OK
        returned_school_names = [school["school_name"] for school in response.data]

        # Should include schools with ratings >= 7
        assert "School Low" not in returned_school_names  # Rating 5 < 7
        assert "School Medium" in returned_school_names   # Rating 7 >= 7
        assert "School High" in returned_school_names     # Rating 9 >= 7

    def test_filter_by_multiple_ratings_greater_than_or_equal(self, api_client, create_school, create_review):
        """
        Test that filtering by multiple ratings returns schools that meet all criteria.
        """
        school1 = create_school("School A", fb=True)
        school2 = create_school("School B", fb=True)
        school3 = create_school("School C", fb=True)

        # Create reviews with different combinations of ratings
        create_review(school1, "Coach X", "Football", {
            "head_coach": 6,
            "team_culture": 8,
            "athletic_facilities": 5
        })
        create_review(school2, "Coach Y", "Football", {
            "head_coach": 8,
            "team_culture": 7,
            "athletic_facilities": 9
        })
        create_review(school3, "Coach Z", "Football", {
            "head_coach": 9,
            "team_culture": 6,
            "athletic_facilities": 8
        })

        # Filter by multiple criteria
        url = reverse("filter-schools")
        response = api_client.get(url + "?head_coach=7&team_culture=7&athletic_facilities=7")
        assert response.status_code == status.HTTP_200_OK
        returned_school_names = [school["school_name"] for school in response.data]

        # School A: head_coach(6) < 7, team_culture(8) >= 7, athletic_facilities(5) < 7
        # School B: head_coach(8) >= 7, team_culture(7) >= 7, athletic_facilities(9) >= 7
        # School C: head_coach(9) >= 7, team_culture(6) < 7, athletic_facilities(8) >= 7

        assert "School A" not in returned_school_names  # Fails head_coach and athletic_facilities criteria
        assert "School B" in returned_school_names      # Meets all criteria
        assert "School C" not in returned_school_names  # Fails team_culture criteria
