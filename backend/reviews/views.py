from rest_framework import generics, permissions, viewsets, permissions, status
from .models import Reviews, ReviewVote
from .serializers import ReviewsSerializer, ReviewVoteSerializer
from django.db.models import Count, Q
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404


class CreateReviewView(generics.CreateAPIView):
    queryset = Reviews.objects.all()
    serializer_class = ReviewsSerializer
    permission_classes = [permissions.IsAuthenticated]  # Require JWT authentication

    def perform_create(self, serializer):
        review = serializer.save(user=self.request.user)

        # Clear the stored summary to force regeneration on next request
        school = review.school
        school.review_summary = None
        school.last_review_date = None
        school.save()


class UserReviewsView(generics.ListAPIView):
    serializer_class = ReviewsSerializer
    permission_classes = [permissions.IsAuthenticated]  # Require JWT authentication

    def get_queryset(self):
        return Reviews.objects.filter(user=self.request.user)


class ReviewViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Reviews.objects.all().annotate(
        helpful_count=Count('votes', filter=Q(votes__vote=1)),
        unhelpful_count=Count('votes', filter=Q(votes__vote=0)),
    )
    serializer_class = ReviewsSerializer

class ReviewVoteAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, review_id):
        review = get_object_or_404(Reviews, review_id=review_id)
        try:
            vote_value = int(request.data.get('vote'))
        except (TypeError, ValueError):
            return Response({'detail': 'Invalid vote value.'}, status=status.HTTP_400_BAD_REQUEST)
        if vote_value not in (0, 1):
            return Response({'detail': 'Vote must be 0 or 1.'}, status=status.HTTP_400_BAD_REQUEST)

        existing = ReviewVote.objects.filter(review=review, user=request.user).first()
        if existing and existing.vote == vote_value:
            existing.delete()
            current_vote = None
        else:
            obj, created = ReviewVote.objects.update_or_create(
                review=review, user=request.user,
                defaults={'vote': vote_value}
            )
            current_vote = obj.vote

        helpful_count = review.votes.filter(vote=1).count()
        unhelpful_count = review.votes.filter(vote=0).count()

        return Response({
            'vote': current_vote,
            'helpful_count': helpful_count,
            'unhelpful_count': unhelpful_count,
        }, status=status.HTTP_200_OK)
