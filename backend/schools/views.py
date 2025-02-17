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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_school_detail(request, school_id):
    try:
        school = Schools.objects.get(id=school_id)
        school_data = {
            'id': school.id,
            'name': school.school_name,
            'conference': school.conference,
            'ports': [
                {
                    'id': port.id,
                    'name': port.name,
                    # Add any other port fields you want to include
                }
                for port in school.ports.all()
            ]
        }
        return Response(school_data, status=status.HTTP_200_OK)
    except Schools.DoesNotExist:
        return Response(
            {'error': 'School not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
