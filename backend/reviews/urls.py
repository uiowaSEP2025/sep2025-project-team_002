from django.urls import path
from .views import CreateReviewView, UserReviewsView, ReviewVoteAPIView

urlpatterns = [
    path("review-form/", CreateReviewView.as_view(), name="review-form"),
    path("user-reviews/", UserReviewsView.as_view(), name="user-reviews"),
    path('<uuid:review_id>/vote/', ReviewVoteAPIView.as_view(), name='review-vote'),
]
