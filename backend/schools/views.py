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
    sport = request.GET.get('sport')
    
    try:
        school = Schools.objects.get(pk=school_id)
        
        # Get the latest review for this sport
        latest_review = Reviews.objects.filter(
            school_id=school_id,
            sport=sport
        ).order_by('-created_at').first()
        
        if not latest_review:
            return Response({
                "summary": f"No reviews available for {sport} at this school yet."
            })
        
        # Get stored summaries and dates
        summaries = school.sport_summaries or {}
        last_dates = school.sport_review_dates or {}
        
        # Check if we have a valid stored summary for this sport
        if sport in summaries and sport in last_dates:
            stored_date = last_dates[sport]
            latest_date = latest_review.created_at.isoformat()
            if stored_date >= latest_date:
                return Response({"summary": summaries[sport]})
        
        # Generate new summary if needed
        try:
            if not settings.OPENAI_API_KEY:
                logger.error("OpenAI API key is not configured")
                return Response(
                    {"error": "OpenAI API key is not configured"}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # Get all reviews for this sport
            reviews = Reviews.objects.filter(
                school_id=school_id,
                sport=sport
            )
            reviews_text = " ".join([review.review_message for review in reviews])
            
            client = OpenAI()
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system", 
                        "content": f"You are a helpful assistant that summarizes {sport} program reviews. Provide a concise summary in exactly 2 sentences, without using bullet points or dashes. Focus on the most important themes and overall sentiment from the reviews. Always talk about it from a reviews perspective, like 'reviewers state...'"
                    },
                    {"role": "user", "content": reviews_text}
                ],
                max_tokens=250
            )
            
            summary = response.choices[0].message.content
            
            # Store the new summary and date
            summaries[sport] = summary
            last_dates[sport] = latest_review.created_at.isoformat()
            school.sport_summaries = summaries
            school.sport_review_dates = last_dates
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
