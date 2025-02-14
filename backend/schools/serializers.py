from rest_framework import serializers
from .models import Schools  # Assuming your model is named School

class SchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schools
        fields = '__all__'  # Or specify fields like ('id', 'name')
