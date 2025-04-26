from rest_framework import (
    generics,
    permissions,
    status,
    viewsets,
    permissions,
    serializers,
)
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Reviews, ReviewVote
from .serializers import ReviewsSerializer, ReviewVoteSerializer
from .services import CoachSearchService
from schools.models import Schools
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
import logging

logger = logging.getLogger(__name__)


class ReviewCreateView(generics.CreateAPIView):
    queryset = Reviews.objects.all()
    serializer_class = ReviewsSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        try:
            school_id = self.request.data.get("school")
            school = Schools.objects.get(id=school_id)
            sport = self.request.data.get("sport")
            coach_name = self.request.data.get("head_coach_name")

            # Get coach history from JSON data only
            coach_service = CoachSearchService()
            history, _ = coach_service.search_coach_history(
                coach_name, school.school_name, sport
            )

            # Only save the review with coach history if it exists in JSON
            review = serializer.save(
                user=self.request.user,
                coach_history=history,  # Will be None if not in JSON
                coach_no_longer_at_university=False,  # This will be determined by frontend display logic
            )

            # Only clear the summary for this specific coach
            school = review.school
            if school.sport_summaries and sport in school.sport_summaries:
                # Get the existing summaries for this sport
                sport_summaries = school.sport_summaries[sport]
                # Only remove the summary for the coach being reviewed
                if coach_name in sport_summaries:
                    sport_summaries.pop(coach_name)
                    school.sport_summaries[sport] = sport_summaries
                    school.save()

            logger.info(
                f"Successfully created review for {coach_name} at {school.school_name}"
            )

        except Exception as e:
            logger.error(f"Error creating review: {str(e)}")
            raise serializers.ValidationError(str(e))


class UserReviewsView(generics.ListAPIView):
    serializer_class = ReviewsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Reviews.objects.filter(user=self.request.user)


class ReviewViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Reviews.objects.all().annotate(
        helpful_count=Count("votes", filter=Q(votes__vote=1)),
        unhelpful_count=Count("votes", filter=Q(votes__vote=0)),
    )
    serializer_class = ReviewsSerializer


class ReviewVoteAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, review_id):
        review = get_object_or_404(Reviews, review_id=review_id)
        try:
            vote_value = int(request.data.get("vote"))
        except (TypeError, ValueError):
            return Response(
                {"detail": "Invalid vote value."}, status=status.HTTP_400_BAD_REQUEST
            )
        if vote_value not in (0, 1):
            return Response(
                {"detail": "Vote must be 0 or 1."}, status=status.HTTP_400_BAD_REQUEST
            )

        existing = ReviewVote.objects.filter(review=review, user=request.user).first()
        if existing and existing.vote == vote_value:
            existing.delete()
            current_vote = None
        else:
            obj, created = ReviewVote.objects.update_or_create(
                review=review, user=request.user, defaults={"vote": vote_value}
            )
            current_vote = obj.vote

        helpful_count = review.votes.filter(vote=1).count()
        unhelpful_count = review.votes.filter(vote=0).count()

        return Response(
            {
                "vote": current_vote,
                "helpful_count": helpful_count,
                "unhelpful_count": unhelpful_count,
            },
            status=status.HTTP_200_OK,
        )


@require_http_methods(["GET"])
def get_school_reviews(request, school_id):
    try:
        sport = request.GET.get("sport")
        if not sport:
            logger.error(
                f"Sport parameter missing for school reviews request: school_id={school_id}"
            )
            return JsonResponse({"error": "Sport parameter is required"}, status=400)

        school = Schools.objects.get(id=school_id)
        reviews = Reviews.objects.filter(school=school, sport=sport).order_by(
            "-created_at"
        )

        # Initialize coach service for checking tenure
        coach_service = CoachSearchService()

        reviews_data = []
        for review in reviews:
            # Check if coach is still at the school
            history, _ = coach_service.search_coach_history(
                review.head_coach_name, school.school_name, sport
            )
            is_no_longer_at_school = False

            if history and history != "No tenure found":
                tenure_entries = history.split("\n")
                if tenure_entries:
                    most_recent_tenure = tenure_entries[-1].lower()
                    normalized_school_name = coach_service._normalize_name(
                        school.school_name
                    )
                    logger.info(
                        f"Comparing schools - Most recent tenure: {most_recent_tenure}, Normalized school name: {normalized_school_name}"
                    )
                    is_no_longer_at_school = not most_recent_tenure.endswith(
                        f"@{normalized_school_name}"
                    )
                    logger.info(f"Is no longer at school: {is_no_longer_at_school}")

            review_data = {
                "id": review.id,
                "review_id": review.review_id,
                "head_coach_name": review.head_coach_name,
                "review_message": review.review_message,
                "head_coach": review.head_coach,
                "assistant_coaches": review.assistant_coaches,
                "team_culture": review.team_culture,
                "campus_life": review.campus_life,
                "athletic_facilities": review.athletic_facilities,
                "athletic_department": review.athletic_department,
                "player_development": review.player_development,
                "nil_opportunity": review.nil_opportunity,
                "created_at": review.created_at.isoformat(),
                "coach_history": history,
                "is_no_longer_at_school": is_no_longer_at_school,
            }
            reviews_data.append(review_data)

        logger.info(
            f"Successfully fetched {len(reviews_data)} reviews for school {school_id}, sport {sport}"
        )
        return JsonResponse(reviews_data, safe=False)

    except Schools.DoesNotExist:
        logger.error(f"School not found for reviews request: school_id={school_id}")
        return JsonResponse({"error": "School not found"}, status=404)
    except Exception as e:
        logger.error(
            f"Error fetching school reviews: school_id={school_id}, error={str(e)}"
        )
        return JsonResponse({"error": "Internal server error"}, status=500)
