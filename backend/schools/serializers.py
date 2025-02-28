from rest_framework import serializers
from .models import Schools
from reviews.models import Reviews
from reviews.serializers import ReviewSerializer

class SchoolSerializer(serializers.ModelSerializer):
    available_sports = serializers.SerializerMethodField()
    reviews = serializers.SerializerMethodField()

    class Meta:
        model = Schools
        fields = ['id', 'school_name', 'mbb', 'wbb', 'fb', 'conference', 'location', 'available_sports', 'reviews']

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
        reviews = Reviews.objects.filter(school=obj.id)
        return ReviewSerializer(reviews, many=True).data
