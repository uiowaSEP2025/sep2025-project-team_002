from rest_framework import serializers
from .models import Schools
from reviews.models import Reviews
from reviews.serializers import ReviewsSerializer
import logging

logger = logging.getLogger(__name__)

class SchoolSerializer(serializers.ModelSerializer):
    available_sports = serializers.SerializerMethodField()
    reviews = serializers.SerializerMethodField()

    class Meta:
        model = Schools
        fields = [
            "id",
            "school_name",
            "mbb",
            "wbb",
            "fb",
            "conference",
            "location",
            "available_sports",
            "reviews",
        ]

    def get_available_sports(self, obj):
        sports = []
        if obj.mbb:
            sports.append("Men's Basketball")
        if obj.wbb:
            sports.append("Women's Basketball")
        if obj.fb:
            sports.append("Football")
        return sports

    def get_reviews(self, obj):
        logger.info(f"Getting reviews for school: {obj.school_name}")
        reviews = Reviews.objects.filter(school=obj.id).order_by('-created_at')
        logger.info(f"Found {reviews.count()} reviews")
        serialized_reviews = ReviewsSerializer(reviews, many=True).data
        logger.info(f"Serialized reviews: {serialized_reviews}")
        return serialized_reviews
