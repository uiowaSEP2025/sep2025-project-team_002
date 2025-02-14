from django.urls import path
from .views import SchoolListView

urlpatterns = [
    path('schools/', SchoolListView.as_view(), name='school-list'),
]