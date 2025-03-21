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
        # Get the school
        school = Schools.objects.get(pk=school_id)
        
        # Get the latest review date
        latest_review = Reviews.objects.filter(school_id=school_id).order_by('-created_at').first()
        
        # If there are no reviews, return appropriate message
        if not latest_review:
            return Response({
                "summary": "No reviews available for this school yet."
            })
        
        # If we have a stored summary and no new reviews have been added since last summary
        if school.review_summary and school.last_review_date and \
           school.last_review_date >= latest_review.created_at:
            return Response({"summary": school.review_summary})
        
        # If we need to generate a new summary
        try:
            # Check if OpenAI API key is configured
            if not settings.OPENAI_API_KEY:
                logger.error("OpenAI API key is not configured")
                return Response(
                    {"error": "OpenAI API key is not configured"}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # Get all reviews and combine them
            reviews = Reviews.objects.filter(school_id=school_id)
            reviews_text = " ".join([review.review_message for review in reviews])
            
            # Generate new summary
            client = OpenAI()
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system", 
                        "content": "You are a helpful assistant that summarizes school reviews. Provide a concise summary in exactly 2 sentences, without using bullet points or dashes. Focus on the most important themes and overall sentiment from the reviews. Always talk about it form a reviews perspective, like 'reviewers state...'"
                    },
                    {"role": "user", "content": reviews_text}
                ],
                max_tokens=250
            )
            
            summary = response.choices[0].message.content
            
            # Store the new summary and update last_review_date
            school.review_summary = summary
            school.last_review_date = latest_review.created_at
            school.save()
            
            return Response({"summary": summary})
            
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            return Response(
                {"error": f"Error generating summary: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    except Schools.DoesNotExist:
        return Response(
            {"error": "School not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Unexpected error in get_review_summary: {str(e)}")
        return Response(
            {"error": f"An unexpected error occurred: {str(e)}"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
