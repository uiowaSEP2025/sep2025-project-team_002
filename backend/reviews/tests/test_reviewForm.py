import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from schools.models import Schools
from reviews.models import Reviews

@pytest.mark.django_db
class TestCreateReviewView:
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
        return Schools.objects.create(school_name="Test University",
        mbb=False,  
        wbb=False,  
        fb=True,  
        conference="Test Conference",
        location="The Moon",)

    @pytest.fixture
    def auth_client(self, api_client, create_user):
        user = create_user(email="testuser@example.com",
         first_name ="Billy",
         last_name = "Bob",
         password="password123")
        api_client.force_authenticate(user=user)
        return api_client, user

    def test_create_review_success(self, auth_client, create_school):
        client, user = auth_client

        sport = None
        if create_school.mbb:
            sport = "Men’s Basketball"
        elif create_school.wbb:
            sport = "Women’s Basketball"
        elif create_school.fb:
            sport = "Football"
            
        assert sport is not None, "No valid sport found for this school"

        data = {
            "school": create_school.id,
            "sport": sport,
            "head_coach_name": "John Doe",
            "review_message": "Great experience!",
            "head_coach": 4,
            "assistant_coaches": 4,
            "team_culture": 5,
            "campus_life": 5,
            "athletic_facilities": 5,
            "athletic_department": 4,
            "player_development": 5,
            "nil_opportunity": 3,
        }

        response = client.post("/api/reviews/review-form/", data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert Reviews.objects.count() == 1
        review = Reviews.objects.first()
        assert review.user == user
        assert review.review_message == "Great experience!"

    def test_incomplete_review_fail(self, auth_client, create_school):
        client, user = auth_client

        sport = None
        if create_school.mbb:
            sport = "Men’s Basketball"
        elif create_school.wbb:
            sport = "Women’s Basketball"
        elif create_school.fb:
            sport = "Football"
            
        assert sport is not None, "No valid sport found for this school"

        data = {
            "school": create_school.id,
            "sport": sport,
            "head_coach_name": "Billy Bob",
            "review_message": "",
            "head_coach": 4,
            "assistant_coaches": 4,
            "team_culture": 3,
            "campus_life": 5,
            "athletic_facilities": 5,
            "athletic_department": 9,
            "player_development": 5,
            "nil_opportunity": 1,
        }

        response = client.post("/api/reviews/review-form/", data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert Reviews.objects.count() == 0


    def test_user_reviews_authenticated(self, auth_client, create_school):
        client, user = auth_client

        sport = None
        if create_school.mbb:
            sport = "Men’s Basketball"
        elif create_school.wbb:
            sport = "Women’s Basketball"
        elif create_school.fb:
            sport = "Football"
            
        assert sport is not None, "No valid sport found for this school"

        Reviews.objects.create(
        school=create_school,
        user=user,
        sport=sport,
        head_coach_name="John Doe",
        review_message="Great experience!",
        head_coach=4,
        assistant_coaches=4,
        team_culture=8,
        campus_life=4,
        athletic_facilities=9,
        athletic_department=8,
        player_development=2,
        nil_opportunity=10,
    )

        response = client.get("/api/reviews/user-reviews/")

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["review_message"] == "Great experience!"
        assert response.data[0]["user"] == user.id
    
    def test_user_reviews_different_user(self, auth_client, create_user, create_school):
        client, user = auth_client

        sport = None
        if create_school.mbb:
            sport = "Men’s Basketball"
        elif create_school.wbb:
            sport = "Women’s Basketball"
        elif create_school.fb:
            sport = "Football"
            
        assert sport is not None, "No valid sport found for this school"

        # Create a review for another user
        other_user = create_user(email="otheruser@example.com", first_name="Jane", last_name="Doe", password="password123")
        Reviews.objects.create(
            school=create_school,
            user=other_user,
            sport=sport,
            head_coach_name="John Doe",
            review_message="Not my vibe!",
            head_coach=4,
            assistant_coaches=4,
            team_culture=8,
            campus_life=4,
            athletic_facilities=9,
            athletic_department=8,
            player_development=2,
            nil_opportunity=10,
        )

        response = client.get("/api/reviews/user-reviews/")

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 0  # User should not see another user's reviews
