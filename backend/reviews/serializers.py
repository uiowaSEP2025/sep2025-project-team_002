from rest_framework import serializers
from .models import Reviews


class ReviewSerializer(serializers.ModelSerializer):
    school_name = serializers.ReadOnlyField(source="school.school_name")

    class Meta:
        model = Reviews
        fields = "__all__"  # Includes all fields
        extra_kwargs = {
            "review_id": {"read_only": True},
            "user": {"read_only": True},
        }
