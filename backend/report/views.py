from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


@api_view(['POST'])
def report_issue(request):
    description = request.data.get('description', '')
    # Report.objects.create(description=description)
    return Response({'message': 'Issue reported successfully'}, status=status.HTTP_201_CREATED)