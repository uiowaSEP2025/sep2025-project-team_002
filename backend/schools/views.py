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
        print(f"Attempting to fetch school with ID: {school_id}")
        school = Schools.objects.get(id=school_id)
        print(f"Found school: {school.school_name}")
        
        # Create sports list using the correct field names
        sports = []
        if school.mbb:  # Using direct field access
            sports.append({"id": "mbb", "name": "Men's Basketball"})
        if school.wbb:
            sports.append({"id": "wbb", "name": "Women's Basketball"})
        if school.fb:
            sports.append({"id": "fb", "name": "Football"})
            
        print(f"Sports for {school.school_name}:", sports)  # Debug print

        data = {
            'id': school.id,
            'school_name': school.school_name,
            'conference': school.conference,
            'location': school.location,
            'sports': sports
        }
        print("Sending data:", data)  # Debug print
        return Response(data, status=status.HTTP_200_OK)
    except Schools.DoesNotExist:
        print(f"School with ID {school_id} not found")
        return Response(
            {'error': 'School not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        print(f"Error in get_school_detail: {str(e)}")
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )