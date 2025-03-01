from django.urls import path
from .views import SchoolListView, SchoolDetailView

urlpatterns = [
    path("schools/", SchoolListView.as_view(), name="school-list"),
    path("schools/<int:pk>/", SchoolDetailView.as_view(), name="school-detail"),
]
