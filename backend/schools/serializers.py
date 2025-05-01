from rest_framework import serializers
from .models import Schools
from reviews.models import Reviews
from reviews.serializers import ReviewsSerializer
from django.db.models import Count, Q
import logging

logger = logging.getLogger(__name__)


class SchoolSerializer(serializers.ModelSerializer):
    available_sports = serializers.SerializerMethodField()
    reviews = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = Schools
        fields = [
            "id",
            "school_name",
            "mbb",
            "wbb",
            "fb",
            "vb",
            "ba",
            "wsoc",
            "wr",
            "conference",
            "location",
            "available_sports",
            "reviews",
            "review_count",
            "average_rating",
        ]

    def get_available_sports(self, obj):
        sports = []
        if obj.mbb:
            sports.append("Men's Basketball")
        if obj.wbb:
            sports.append("Women's Basketball")
        if obj.fb:
            sports.append("Football")
        if obj.vb:
            sports.append("Volleyball")
        if obj.ba:
            sports.append("Baseball")
        if obj.wsoc:
            sports.append("Women's Soccer")
        if obj.wr:
            sports.append("Wrestling")
        return sports

    def get_reviews(self, obj):
        qs = (
            Reviews.objects.filter(school=obj)
            .annotate(
                helpful_count=Count("votes", filter=Q(votes__vote=1)),
                unhelpful_count=Count("votes", filter=Q(votes__vote=0)),
            )
            .order_by("-created_at")
        )
        return ReviewsSerializer(qs, many=True, context=self.context).data

    def get_review_count(self, obj):
        return Reviews.objects.filter(school=obj.id).count()

    def get_average_rating(self, obj):
        reviews = Reviews.objects.filter(school=obj.id)
        if not reviews.exists():
            return 0

        # Calculate the average of all rating fields
        total_avg = 0
        count = 0

        # Sum up all the rating fields
        for review in reviews:
            fields_sum = (
                review.head_coach
                + review.assistant_coaches
                + review.team_culture
                + review.campus_life
                + review.athletic_facilities
                + review.athletic_department
                + review.player_development
                + review.nil_opportunity
            )
            total_avg += fields_sum / 8  # Average of 8 rating fields
            count += 1

        # Return the overall average, rounded to 1 decimal place
        return round(total_avg / count, 1) if count > 0 else 0
