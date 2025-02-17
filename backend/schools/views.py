from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Schools
from .serializers import SchoolSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes

# Create your views here.

class SchoolViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Schools.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [IsAuthenticated]

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_schools(request):
    try:
        schools = Schools.objects.all()
        schools_data = [
            {
                'id': school.id,
                'name': school.school_name,
                'conference': school.conference
            }
            for school in schools
        ]
        return Response(schools_data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
