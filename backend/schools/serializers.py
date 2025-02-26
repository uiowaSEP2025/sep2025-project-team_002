from rest_framework import serializers
from .models import Schools  # Assuming your model is named School


class SchoolSerializer(serializers.ModelSerializer):
    available_sports = serializers.SerializerMethodField()

    class Meta:
        model = Schools
        fields = ["id", "school_name", "available_sports", "conference", "location"]

    def get_available_sports(self, obj):
        sports = []
        if obj.mbb:
            sports.append("Men's Basketball")
        if obj.wbb:
            sports.append("Women's Basketball")
        if obj.fb:
            sports.append("Football")
        return sports
