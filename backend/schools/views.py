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
    sport = request.query_params.get("sport", "")

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

    # Filter reviews based on coach, sport, and rating filters
    reviews_query = Reviews.objects.all()
    if coach:
        reviews_query = reviews_query.filter(head_coach_name__icontains=coach)
    if sport:
        reviews_query = reviews_query.filter(sport=sport)
    for field, rating in rating_filters.items():
        reviews_query = reviews_query.filter(**{field: rating})

    school_ids_from_reviews = reviews_query.values_list(
        "school_id", flat=True
    ).distinct()

    # Filter schools based on school name if provided
    schools_query = Schools.objects.all()
    if school_name:
        schools_query = schools_query.filter(school_name__icontains=school_name)

    # If coach or sport or ratings filters are applied, intersect with schools from reviews
    if coach or sport or rating_filters:
        schools_query = schools_query.filter(id__in=school_ids_from_reviews)
        
    # Additional filter for sport field at the school level
    if sport:
        if sport == "Men's Basketball":
            schools_query = schools_query.filter(mbb=True)
        elif sport == "Women's Basketball":
            schools_query = schools_query.filter(wbb=True)
        elif sport == "Football":
            schools_query = schools_query.filter(fb=True)

    serializer = SchoolSerializer(schools_query, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_recommended_schools(request):
    try:
        # Get user's preferences
        user_preferences = Preferences.objects.filter(user=request.user).first()
        if not user_preferences:
            logger.info(f"No preferences found for user {request.user.id}. Returning top schools.")
            # Return top schools with default ratings if no preferences
            top_schools = Schools.objects.all()[:5]
            result = []
            for school in top_schools:
                # Determine default sport based on what the school offers
                sport = "Men's Basketball"
                if school.mbb:
                    sport = "Men's Basketball"
                elif school.wbb:
                    sport = "Women's Basketball"
                elif school.fb:
                    sport = "Football"
                
                result.append({
                    'school': SchoolSerializer(school).data,
                    'similarity_score': 5.0,  # Medium match
                    'sport': sport,
                    'average_ratings': {
                        'head_coach': 5,
                        'assistant_coaches': 5,
                        'team_culture': 5,
                        'campus_life': 5,
                        'athletic_facilities': 5,
                        'athletic_department': 5,
                        'player_development': 5,
                        'nil_opportunity': 5
                    }
                })
            return Response(result)

        # Log for debugging
        logger.info(f"Found preferences for user {request.user.id}, sport: {user_preferences.sport}")
        sport = user_preferences.sport
        
        # Check if there are any reviews for this sport
        sport_reviews = Reviews.objects.filter(sport=sport)
        if not sport_reviews.exists():
            logger.info(f"No reviews found for {sport}")
            return Response([])  # Return empty list if no reviews for this sport
            
        # Get schools that have reviews for this sport
        school_ids_with_reviews = sport_reviews.values_list('school_id', flat=True).distinct()
        logger.info(f"Found {len(school_ids_with_reviews)} schools with reviews for {sport}")
        
        if not school_ids_with_reviews:
            logger.info(f"No schools have reviews for {sport}")
            return Response([])  # Return empty list if no schools have reviews
        
        # Get all schools
        schools = Schools.objects.filter(id__in=school_ids_with_reviews)
        logger.info(f"Total schools with reviews to check: {schools.count()}")
        
        recommended_schools = []

        for school in schools:
            # Check if this school offers the user's preferred sport
            has_sport = False
            if sport == "Men's Basketball" and school.mbb:
                has_sport = True
            elif sport == "Women's Basketball" and school.wbb:
                has_sport = True
            elif sport == "Football" and school.fb:
                has_sport = True
            
            if not has_sport:
                logger.info(f"School {school.school_name} does not offer {sport}, skipping")
                continue
                
            # Get reviews for this school and the user's preferred sport
            reviews = Reviews.objects.filter(school=school, sport=sport)
            
            if not reviews:
                logger.info(f"No reviews for {school.school_name} with sport {sport}")
                continue  # Skip schools without reviews for this sport
            
            logger.info(f"Found {reviews.count()} reviews for {school.school_name} - {sport}")

            # Calculate average ratings
            avg_ratings = {
                'head_coach': reviews.aggregate(avg=models.Avg('head_coach'))['avg'] or 5,
                'assistant_coaches': reviews.aggregate(avg=models.Avg('assistant_coaches'))['avg'] or 5,
                'team_culture': reviews.aggregate(avg=models.Avg('team_culture'))['avg'] or 5,
                'campus_life': reviews.aggregate(avg=models.Avg('campus_life'))['avg'] or 5,
                'athletic_facilities': reviews.aggregate(avg=models.Avg('athletic_facilities'))['avg'] or 5,
                'athletic_department': reviews.aggregate(avg=models.Avg('athletic_department'))['avg'] or 5,
                'player_development': reviews.aggregate(avg=models.Avg('player_development'))['avg'] or 5,
                'nil_opportunity': reviews.aggregate(avg=models.Avg('nil_opportunity'))['avg'] or 5
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
                # Convert to 0-10 scale, higher is better
                similarity_score = 10 - min(10, (similarity_score / total_weight))
                
                # Add this school to recommendations
                recommended_schools.append({
                    'school': SchoolSerializer(school).data,
                    'similarity_score': round(similarity_score, 2),
                    'average_ratings': avg_ratings,
                    'sport': sport
                })
                logger.info(f"Added {school.school_name} for {sport} with score {similarity_score}")

        # Sort by similarity score and return top schools
        recommended_schools.sort(key=lambda x: x['similarity_score'], reverse=True)
        result = recommended_schools[:5] if recommended_schools else []
        
        # We no longer fall back to default recommendations if there are no matches
        # Just return whatever we found, even if it's less than 5 or empty
        logger.info(f"Returning {len(result)} recommendations")
        return Response(result)

    except Exception as e:
        logger.error(f"Error in get_recommended_schools: {str(e)}", exc_info=True)
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
