from rest_framework import serializers
from .models import Users


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "transfer_type",
            "role",
            "created_at",
            "updated_at",
            "is_school_verified",
        ]
