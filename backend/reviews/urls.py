from django.urls import path
from .views import ReviewCreateView, UserReviewsView, get_school_reviews

urlpatterns = [
    path("review-form/", ReviewCreateView.as_view(), name="create-review"),
    path("user-reviews/", UserReviewsView.as_view(), name="user-reviews"),
    path("school/<int:school_id>/", get_school_reviews, name="school-reviews"),
]
