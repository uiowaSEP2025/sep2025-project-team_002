from django.urls import path
from .views import test_api, LoginView, UserDetailView

urlpatterns = [
    path("test/", views.test_api, name="test_api"),
    path('signup/', views.signup, name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('user/', UserDetailView.as_view(), name='user_detail'),

]
