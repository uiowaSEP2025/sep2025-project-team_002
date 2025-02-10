from django.urls import path
from . import views

urlpatterns = [
    path("test/", views.test_api, name="test_api"),
 path('signup/', views.signup, name='signup'),
]
