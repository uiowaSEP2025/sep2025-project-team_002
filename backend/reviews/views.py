from rest_framework import generics, permissions
from .models import Reviews
from .serializers import ReviewSerializer

class CreateReviewView(generics.CreateAPIView):
    queryset = Reviews.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]  # Require JWT authentication

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)  # Assign logged-in user

class UserReviewsView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]  # Require JWT authentication

    def get_queryset(self):
        return Reviews.objects.filter(user=self.request.user)