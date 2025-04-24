from rest_framework import generics, permissions, viewsets, permissions, status
from .models import Reviews, ReviewVote
from .serializers import ReviewsSerializer, ReviewVoteSerializer
from django.db.models import Count, Q
from rest_framework.response import Response
from rest_framework.views import APIView


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
        review = Reviews.objects.get(review_id=review_id)
        serializer = ReviewVoteSerializer(data={
            'review': review.pk,
            'vote': request.data.get('vote'),
        }, context={'request': request})
        serializer.is_valid(raise_exception=True)

        obj, created = ReviewVote.objects.update_or_create(
            review=review, user=request.user,
            defaults={'vote': serializer.validated_data['vote']}
        )
        return Response({
            'vote': obj.vote,
            'helpful_count': review.votes.filter(vote=1).count(),
            'unhelpful_count': review.votes.filter(vote=0).count(),
        }, status=status.HTTP_200_OK)
