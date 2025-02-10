from django.urls import path
from .views import test_api, LoginView, UserDetailView, signup

urlpatterns = [
    path("test/", test_api, name="test_api"),
    path('signup/', signup, name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('user/', UserDetailView.as_view(), name='user_detail'),

]
