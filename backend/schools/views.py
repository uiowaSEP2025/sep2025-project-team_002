from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .models import Schools
from .serializers import SchoolSerializer
from reviews.models import Reviews
from openai import OpenAI
from django.conf import settings
from rest_framework import status
import logging

logger = logging.getLogger(__name__)


@api_view(["GET"])
def get_schools(request):
    schools = Schools.objects.all()
    serializer = SchoolSerializer(schools, many=True)
    return Response(serializer.data)


# Public views
class SchoolListView(generics.ListAPIView):
    queryset = Schools.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [AllowAny]


class SchoolDetailView(generics.RetrieveAPIView):
    queryset = Schools.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [AllowAny]


# Protected views
class ProtectedSchoolListView(generics.ListCreateAPIView):
    queryset = Schools.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [IsAuthenticated]


class ProtectedSchoolDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Schools.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [IsAuthenticated]


@api_view(['GET'])
@permission_classes([AllowAny])
def get_review_summary(request, school_id):
    logger.info(f"Received review summary request for school_id: {school_id}")
    
    try:
        # Check if OpenAI API key is configured
        if not settings.OPENAI_API_KEY:
            logger.error("OpenAI API key is not configured")
            return Response(
                {"error": "OpenAI API key is not configured"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Get all reviews for the school
        reviews = Reviews.objects.filter(school_id=school_id)
        
        if not reviews.exists():
            return Response({
                "summary": "No reviews available for this school yet."
            })

        # Combine all review messages
        reviews_text = " ".join([review.review_message for review in reviews])
        
        try:
            # Initialize OpenAI client with just the API key
            client = OpenAI()  # The API key will be automatically loaded from environment variable
            
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system", 
                        "content": "You are a helpful assistant that summarizes school reviews. Provide a concise summary in exactly 2 sentences, without using bullet points or dashes. Focus on the most important themes and overall sentiment from the reviews."
                    },
                    {"role": "user", "content": reviews_text}
                ],
                max_tokens=250
            )
            
            summary = response.choices[0].message.content
            return Response({"summary": summary})
            
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            return Response(
                {"error": f"Error generating summary: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    except Exception as e:
        logger.error(f"Unexpected error in get_review_summary: {str(e)}")
        return Response(
            {"error": f"An unexpected error occurred: {str(e)}"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
