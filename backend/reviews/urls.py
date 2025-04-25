from django.urls import path
from .views import ReviewCreateView, UserReviewsView, ReviewVoteAPIView, get_school_reviews

urlpatterns = [
    path("review-form/", ReviewCreateView.as_view(), name="create-review"),
    path("user-reviews/", UserReviewsView.as_view(), name="user-reviews"),
    path("school/<int:school_id>/", get_school_reviews, name="school-reviews"),
    path('<uuid:review_id>/vote/', ReviewVoteAPIView.as_view(), name='review-vote'),
]
