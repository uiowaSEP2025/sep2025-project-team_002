from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import serializers
from reviews.serializers import ReviewsSerializer
from reviews.models import Reviews
from schools.models import Schools
from users.models import Users
from unittest.mock import Mock
import uuid


class TestReviewsSerializer(APITestCase):
    def setUp(self):
        # Create test school
        self.school = Schools.objects.create(
            school_name="Test University", mbb=True, wbb=True, fb=True
        )

        # Create test user
        self.user = Users.objects.create(
            email="test@example.com",
            first_name="Test",
            last_name="User",
            is_school_verified=True,
        )

        # Create base review data that satisfies all required fields
        self.base_review_data = {
            "school": self.school,
            "head_coach_name": "Test Coach",
            "review_message": "Test review",
            "head_coach": 5,
            "assistant_coaches": 5,
            "team_culture": 5,
            "campus_life": 5,
            "athletic_facilities": 5,
            "athletic_department": 5,
            "player_development": 5,
            "nil_opportunity": 5,
        }

        self.mock_request = Mock()
        self.mock_request.user = self.user

        # Create serializer data (uses ID for school)
        self.base_serializer_data = {**self.base_review_data, "school": self.school.id}

    def test_sport_validation(self):
        """Test that sport names are correctly converted to codes"""
        data = {**self.base_serializer_data, "sport": "Men's Basketball"}
        serializer = ReviewsSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data["sport"], "mbb")

    def test_sport_display_conversion(self):
        """Test that sport codes are converted back to display names in responses"""
        review = Reviews.objects.create(
            **self.base_review_data, user=self.user, sport="mbb"
        )

        serializer = ReviewsSerializer(review, context={"request": self.mock_request})
        data = serializer.data

        self.assertEqual(data["sport"], "Men's Basketball")

    def test_coach_no_longer_at_university_validation(self):
        """Test validation of coach_no_longer_at_university field"""
        base_data = {
            **self.base_serializer_data,
            "sport": "Men's Basketball",
            "coach_history": "Some history",
        }

        # Test with boolean true
        test_data = {**base_data, "coach_no_longer_at_university": True}
        serializer = ReviewsSerializer(data=test_data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertTrue(serializer.validated_data["coach_no_longer_at_university"])

        # Test with boolean false
        test_data = {**base_data, "coach_no_longer_at_university": False}
        serializer = ReviewsSerializer(data=test_data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertFalse(serializer.validated_data["coach_no_longer_at_university"])

        # Test with field omitted (should default to False)
        test_data = {**base_data}
        serializer = ReviewsSerializer(data=test_data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertFalse(serializer.validated_data["coach_no_longer_at_university"])

    def test_school_name_field(self):
        """Test that school_name field is correctly populated"""
        review = Reviews.objects.create(
            **self.base_review_data, user=self.user, sport="mbb"
        )

        serializer = ReviewsSerializer(review, context={"request": self.mock_request})
        data = serializer.data

        self.assertEqual(data["school_name"], "Test University")

    def test_user_serialization(self):
        """Test that user data is correctly serialized"""
        review = Reviews.objects.create(
            **self.base_review_data, user=self.user, sport="mbb"
        )

        serializer = ReviewsSerializer(review, context={"request": self.mock_request})
        data = serializer.data

        self.assertEqual(data["user"]["id"], self.user.id)
        self.assertTrue(data["user"]["is_school_verified"])
        self.assertEqual(data["user"]["profile_picture"], self.user.profile_picture)
