from rest_framework import serializers
from .models import Preferences
import logging

logger = logging.getLogger(__name__)


class PreferencesSerializer(serializers.ModelSerializer):
    def validate_sport(self, value):
        # Convert display names to database codes
        sport_mapping = {
            "Men's Basketball": "mbb",
            "Men's Basketball": "mbb",  # Handle both apostrophe types
            "Women's Basketball": "wbb",
            "Women's Basketball": "wbb",  # Handle both apostrophe types
            "Football": "fb",
            "Volleyball": "vb",
        }
        logger.info(
            f"PreferencesSerializer.validate_sport: Converting '{value}' to code"
        )
        code = sport_mapping.get(value, value)
        logger.info(f"PreferencesSerializer.validate_sport: Converted to '{code}'")
        return code

    def to_representation(self, instance):
        # Convert database codes back to display names when sending response
        data = super().to_representation(instance)
        display_mapping = {
            "mbb": "Men's Basketball",
            "wbb": "Women's Basketball",
            "fb": "Football",
            "vb" :"Volleyball",
        }
        original_sport = data["sport"]
        data["sport"] = display_mapping.get(data["sport"], data["sport"])
        logger.info(
            f"PreferencesSerializer.to_representation: Converting sport from '{original_sport}' to '{data['sport']}'"
        )
        return data

    class Meta:
        model = Preferences
        fields = "__all__"  # Include all fields or specify specific ones as needed
        read_only_fields = ["user"]  # Prevent users from modifying the user field
