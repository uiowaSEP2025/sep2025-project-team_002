from django.urls import path
from .views import CreateReviewView

urlpatterns = [
    path('review-form/', CreateReviewView.as_view(), name='review-form'),
]