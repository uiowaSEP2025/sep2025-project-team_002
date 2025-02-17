from rest_framework import serializers
from .models import Schools

class SchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schools
        fields = ['id', 'name', 'conference'] 