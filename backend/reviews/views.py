from rest_framework import generics, permissions, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import Reviews
from .serializers import ReviewsSerializer
from .services import CoachSearchService
from schools.models import Schools
import logging
from rest_framework import serializers
from rest_framework.decorators import api_view, permission_classes
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

logger = logging.getLogger(__name__)


class ReviewCreateView(generics.CreateAPIView):
    queryset = Reviews.objects.all()
    serializer_class = ReviewsSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        try:
            school_id = self.request.data.get('school')
            school = Schools.objects.get(id=school_id)
            sport = self.request.data.get('sport')
            coach_name = self.request.data.get('head_coach_name')
            
            # Get coach history for all sports
            coach_service = CoachSearchService()
            history, _ = coach_service.search_coach_history(coach_name, school.school_name)
            
            # Save the review with coach history
            review = serializer.save(
                user=self.request.user,
                coach_history=history,
                coach_no_longer_at_university=False  # This will be determined by frontend display logic
            )
            
            # Clear the stored summary to force regeneration on next request
            school = review.school
            if school.sport_summaries:
                school.sport_summaries.pop(review.sport, None)
            if school.sport_review_dates:
                school.sport_review_dates.pop(review.sport, None)
            school.save()

            return review
            
        except Schools.DoesNotExist:
            raise serializers.ValidationError({"error": "School not found"})
        except Exception as e:
            raise serializers.ValidationError({"error": str(e)})


class UserReviewsView(generics.ListAPIView):
    serializer_class = ReviewsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Reviews.objects.filter(user=self.request.user)


@require_http_methods(["GET"])
def get_school_reviews(request, school_id):
    try:
        sport = request.GET.get('sport')
        if not sport:
            logger.error(f"Sport parameter missing for school reviews request: school_id={school_id}")
            return JsonResponse({"error": "Sport parameter is required"}, status=400)

        school = Schools.objects.get(id=school_id)
        reviews = Reviews.objects.filter(
            school=school,
            sport=sport
        ).order_by('-created_at')

        reviews_data = [{
            'id': review.id,
            'rating': review.rating,
            'text': review.text,
            'created_at': review.created_at.isoformat(),
            'user': review.user.username if review.user else 'Anonymous'
        } for review in reviews]

        logger.info(f"Successfully fetched {len(reviews_data)} reviews for school {school_id}, sport {sport}")
        return JsonResponse(reviews_data, safe=False)

    except Schools.DoesNotExist:
        logger.error(f"School not found for reviews request: school_id={school_id}")
        return JsonResponse({"error": "School not found"}, status=404)
    except Exception as e:
        logger.error(f"Error fetching school reviews: school_id={school_id}, error={str(e)}")
        return JsonResponse({"error": "Internal server error"}, status=500)
