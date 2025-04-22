from django.urls import path
from .views import ReviewCreateView, UserReviewsView

urlpatterns = [
    path("review-form/", ReviewCreateView.as_view(), name="create-review"),
    path("user-reviews/", UserReviewsView.as_view(), name="user-reviews"),
]
