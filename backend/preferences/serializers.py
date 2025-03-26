from rest_framework import serializers
from .models import Preferences


class PreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Preferences
        fields = "__all__"  # Include all fields or specify specific ones as needed
        read_only_fields = ["user"]  # Prevent users from modifying the user field
