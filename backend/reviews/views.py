from rest_framework import generics, permissions, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Reviews
from .serializers import ReviewsSerializer
from .services import CoachSearchService
from schools.models import Schools
import logging
from rest_framework import serializers

logger = logging.getLogger(__name__)


class ReviewCreateView(generics.CreateAPIView):
    queryset = Reviews.objects.all()
    serializer_class = ReviewsSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        try:
            # Get the school name
            school_id = self.request.data.get('school')
            logger.info(f"Creating review for school_id: {school_id}")
            logger.info(f"Full request data: {self.request.data}")
            
            school = Schools.objects.get(id=school_id)
            logger.info(f"Found school: {school.school_name}")
            
            sport = self.request.data.get('sport')
            logger.info(f"Sport from request: {sport}")
            
            # Only check coach history for Men's Basketball (mbb)
            if sport == "Men's Basketball" or sport == "mbb":
                coach_name = self.request.data.get('head_coach_name')
                logger.info(f"Checking coach history for: {coach_name}")
                
                coach_service = CoachSearchService()
                history, no_longer_at_university = coach_service.search_coach_history(
                    coach_name, 
                    school.school_name
                )
                
                logger.info(f"Coach history found: {history}")
                logger.info(f"No longer at university: {no_longer_at_university}")
                
                # Save the review with coach history
                review = serializer.save(
                    user=self.request.user,
                    coach_history=history,
                    coach_no_longer_at_university=no_longer_at_university
                )
                logger.info(f"Saved review with coach history. Review ID: {review.review_id}")
            else:
                # For other sports, just save normally
                review = serializer.save(user=self.request.user)
                logger.info(f"Saved review without coach history. Review ID: {review.review_id}")
            
            logger.info(f"Review created successfully: {review.review_id}")
            logger.info(f"Final review data: {ReviewsSerializer(review).data}")
            return review
                
        except Schools.DoesNotExist:
            logger.error(f"School not found: {school_id}")
            raise serializers.ValidationError({"error": "School not found"})
        except Exception as e:
            logger.error(f"Error creating review: {str(e)}", exc_info=True)
            raise serializers.ValidationError({"error": str(e)})


class UserReviewsView(generics.ListAPIView):
    serializer_class = ReviewsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Reviews.objects.filter(user=self.request.user)
