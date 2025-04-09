from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .models import Schools
from .serializers import SchoolSerializer
from reviews.models import Reviews
from openai import OpenAI
from django.conf import settings
import logging
from django.db import models
from preferences.models import Preferences

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


@api_view(["GET"])
@permission_classes([AllowAny])
def get_review_summary(request, school_id):
    logger.info(f"Received review summary request for school_id: {school_id}")
    sport = request.GET.get("sport")

    try:
        school = Schools.objects.get(pk=school_id)

        # Get the latest review for this sport
        latest_review = (
            Reviews.objects.filter(school_id=school_id, sport=sport)
            .order_by("-created_at")
            .first()
        )
        if not latest_review:
            return Response(
                {"summary": f"No reviews available for {sport} at this school yet."}
            )

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
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            # Get all reviews for this sport
            reviews = Reviews.objects.filter(school_id=school_id, sport=sport)
            reviews_text = " ".join([review.review_message for review in reviews])
            client = OpenAI()
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": f"You are a helpful assistant that summarizes {sport} program reviews. Provide a concise summary in exactly 2 sentences, without using bullet points or dashes. Focus on the most important themes and overall sentiment from the reviews. Always talk about it from a reviews perspective, like 'reviewers state...'",
                    },
                    {"role": "user", "content": reviews_text},
                ],
                max_tokens=250,
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
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
    except Schools.DoesNotExist:
        return Response({"error": "School not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Unexpected error in get_review_summary: {str(e)}")
        return Response(
            {"error": f"An unexpected error occurred: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# New endpoint for filtering schools based on reviews and ratings
@api_view(["GET"])
@permission_classes([AllowAny])
def filter_schools(request):
    school_name = request.query_params.get("school_name", "")
    coach = request.query_params.get("coach", "")

    # Prepare rating filters
    rating_fields = [
        "head_coach",
        "assistant_coaches",
        "team_culture",
        "campus_life",
        "athletic_facilities",
        "athletic_department",
        "player_development",
        "nil_opportunity",
    ]
    rating_filters = {}
    for field in rating_fields:
        val = request.query_params.get(field, "")
        if val:
            try:
                rating_filters[field] = int(val)
            except ValueError:
                pass

    # Filter reviews based on coach and rating filters
    reviews_query = Reviews.objects.all()
    if coach:
        reviews_query = reviews_query.filter(head_coach_name__icontains=coach)
    for field, rating in rating_filters.items():
        reviews_query = reviews_query.filter(**{field: rating})

    school_ids_from_reviews = reviews_query.values_list(
        "school_id", flat=True
    ).distinct()

    # Filter schools based on school name if provided
    schools_query = Schools.objects.all()
    if school_name:
        schools_query = schools_query.filter(school_name__icontains=school_name)

    # If coach or ratings filters are applied, intersect with schools from reviews
    if coach or rating_filters:
        schools_query = schools_query.filter(id__in=school_ids_from_reviews)

    serializer = SchoolSerializer(schools_query, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_recommended_schools(request):
    try:
        # Get user's preferences
        user_preferences = Preferences.objects.filter(user=request.user).first()
        if not user_preferences:
            return Response({"message": "No preferences found. Please submit your preferences first."}, 
                          status=status.HTTP_404_NOT_FOUND)

        # Get all schools with reviews for the user's preferred sport
        schools = Schools.objects.all()
        recommended_schools = []

        for school in schools:
            # Get all reviews for this school and sport
            reviews = Reviews.objects.filter(school=school, sport=user_preferences.sport)
            if not reviews:
                continue

            # Calculate average ratings
            avg_ratings = {
                'head_coach': reviews.aggregate(avg=models.Avg('head_coach'))['avg'],
                'assistant_coaches': reviews.aggregate(avg=models.Avg('assistant_coaches'))['avg'],
                'team_culture': reviews.aggregate(avg=models.Avg('team_culture'))['avg'],
                'campus_life': reviews.aggregate(avg=models.Avg('campus_life'))['avg'],
                'athletic_facilities': reviews.aggregate(avg=models.Avg('athletic_facilities'))['avg'],
                'athletic_department': reviews.aggregate(avg=models.Avg('athletic_department'))['avg'],
                'player_development': reviews.aggregate(avg=models.Avg('player_development'))['avg'],
                'nil_opportunity': reviews.aggregate(avg=models.Avg('nil_opportunity'))['avg']
            }

            # Calculate similarity score (weighted average of rating differences)
            similarity_score = 0
            total_weight = 0
            for field in avg_ratings:
                if avg_ratings[field] is not None:
                    user_pref = getattr(user_preferences, field)
                    similarity_score += abs(user_pref - avg_ratings[field])
                    total_weight += 1

            if total_weight > 0:
                similarity_score = 10 - (similarity_score / total_weight)  # Convert to 0-10 scale
                recommended_schools.append({
                    'school': SchoolSerializer(school).data,
                    'similarity_score': round(similarity_score, 2),
                    'average_ratings': avg_ratings
                })

        # Sort by similarity score and return top 5
        recommended_schools.sort(key=lambda x: x['similarity_score'], reverse=True)
        return Response(recommended_schools[:5])

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
