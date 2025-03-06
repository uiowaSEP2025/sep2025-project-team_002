from django.urls import path
from .views import (
    SchoolListView,
    SchoolDetailView,
    ProtectedSchoolListView,
    ProtectedSchoolDetailView,
    get_schools,
)

urlpatterns = [
    # Public endpoints (no authentication required)
    path("public/schools/", SchoolListView.as_view(), name="public-school-list"),
    path(
        "public/schools/<int:pk>/",
        SchoolDetailView.as_view(),
        name="public-school-detail",
    ),
    # Protected endpoints (authentication required)
    path("schools/", ProtectedSchoolListView.as_view(), name="school-list"),
    path(
        "schools/<int:pk>/", ProtectedSchoolDetailView.as_view(), name="school-detail"
    ),
    path("api/public/schools/", get_schools, name="get_schools"),
]
