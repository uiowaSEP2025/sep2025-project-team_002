from rest_framework import generics
from .models import Schools
from .serializers import SchoolSerializer


class SchoolListView(generics.ListAPIView):
    queryset = Schools.objects.all()
    serializer_class = SchoolSerializer
