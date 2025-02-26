from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from django.conf import settings


@api_view(['POST'])
def report_issue(request):
    # Extract data from request
    email = request.data.get('email')
    name = request.data.get('name', '')
    description = request.data.get('description', '')

    # Validate required fields
    if not email or not description:
        return Response({'error': 'Email and description are required.'}, status=status.HTTP_400_BAD_REQUEST)

    # Prepare email subject and message
    subject = 'New Issue Reported'
    message = f"Reporter Email: {email}\nReporter Name: {name}\nReport Description:\n{description}"

    # Send email using Django's send_mail function
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,  # sender email
            [settings.REPORT_RECEIVER_EMAIL],  # receiver list
            fail_silently=False,
        )
    except Exception as e:
        return Response({'error': f'Email sending failed: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({'message': 'Issue reported successfully.'}, status=status.HTTP_201_CREATED)