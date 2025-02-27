from django.urls import path
from .views import SchoolListView

urlpatterns = [
    path("schools/", SchoolListView.as_view(), name="school-list"),
]
from django.urls import path
from .views import SchoolViewSet, get_schools, get_school_detail

urlpatterns = [
    path('', get_schools, name='schools-list'),
    path('<int:school_id>/', get_school_detail, name='school-detail'),
] 