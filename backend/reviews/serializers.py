from rest_framework import serializers
from .models import Reviews
from users.models import Users
import logging

logger = logging.getLogger(__name__)


class ReviewUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ["id", "is_school_verified", "profile_picture"]


class ReviewsSerializer(serializers.ModelSerializer):
    school_name = serializers.ReadOnlyField(source="school.school_name")
    user = ReviewUserSerializer(read_only=True)

    def validate_sport(self, value):
        # Convert display names to database codes
        sport_mapping = {
            "Men's Basketball": "mbb",
            "Men’s Basketball": "mbb",  # Handle both apostrophe types
            "Women's Basketball": "wbb",
            "Women’s Basketball": "wbb",  # Handle both apostrophe types

            "Football": "fb",
        }
        logger.info(f"ReviewsSerializer.validate_sport: Converting '{value}' to code")
        code = sport_mapping.get(value, value)
        logger.info(f"ReviewsSerializer.validate_sport: Converted to '{code}'")
        return code

    def to_representation(self, instance):
        # Convert database codes back to display names when sending response
        data = super().to_representation(instance)
        display_mapping = {
            "mbb": "Men's Basketball",
            "wbb": "Women's Basketball",
            "fb": "Football",
        }
        original_sport = data["sport"]
        data["sport"] = display_mapping.get(data["sport"], data["sport"])
        logger.info(
            f"ReviewsSerializer.to_representation: Converting sport from '{original_sport}' to '{data['sport']}'"
        )
        return data

    def validate(self, data):
        """
        Validate the review data
        """
        # Ensure coach_no_longer_at_university is a boolean
        if "coach_no_longer_at_university" in data:
            try:
                data["coach_no_longer_at_university"] = bool(
                    data["coach_no_longer_at_university"]
                )
            except (ValueError, TypeError):
                data["coach_no_longer_at_university"] = False
        else:
            data["coach_no_longer_at_university"] = False

        return data

    class Meta:
        model = Reviews
        fields = [
            "id",
            "review_id",
            "school",
            "user",
            "sport",
            "head_coach_name",
            "review_message",
            "head_coach",
            "assistant_coaches",
            "team_culture",
            "campus_life",
            "athletic_facilities",
            "athletic_department",
            "player_development",
            "nil_opportunity",
            "created_at",
            "updated_at",
            "coach_no_longer_at_university",
            "coach_history",
        ]
        read_only_fields = ["review_id", "user", "created_at", "updated_at"]
