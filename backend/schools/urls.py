from django.urls import path
from .views import (
    SchoolListView,
    SchoolDetailView,
    ProtectedSchoolListView,
    ProtectedSchoolDetailView,
    get_schools,
    get_review_summary,
    filter_schools,
    get_recommended_schools,
    debug_reviews,
)

urlpatterns = [
    # Public endpoints (no authentication required)
    path("public/schools/", SchoolListView.as_view(), name="public-school-list"),
    path(
        "public/schools/<int:pk>/",
        SchoolDetailView.as_view(),
        name="public-school-detail",
    ),
    path(
        "public/schools/<int:school_id>/reviews/summary/",
        get_review_summary,
        name="public-review-summary",
    ),
    path(
        "public/schools/<int:school_id>/reviews/debug/",
        debug_reviews,
        name="debug-reviews",
    ),
    # Protected endpoints (authentication required)
    path("schools/", ProtectedSchoolListView.as_view(), name="school-list"),
    path(
        "schools/<int:pk>/", ProtectedSchoolDetailView.as_view(), name="school-detail"
    ),
    path("api/public/schools/", get_schools, name="get_schools"),
    path(
        "schools/<int:school_id>/reviews/summary/",
        get_review_summary,
        name="review-summary",
    ),
    path("filter/", filter_schools, name="filter-schools"),
    path("recommendations/", get_recommended_schools, name="recommended-schools"),
]
