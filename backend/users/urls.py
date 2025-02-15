from django.urls import path
from .views import (
    test_api,
    LoginView,
    UserDetailView,
    signup,
    change_password,
    forgot_password,
    reset_password,
)

urlpatterns = [
    path("test/", test_api, name="test_api"),
    path("signup/", signup, name="signup"),
    path("login/", LoginView.as_view(), name="login"),
    path("user/", UserDetailView.as_view(), name="user_detail"),
    path("change-password/", change_password, name="change_password"),
    path("forgot-password/", forgot_password, name="forgot_password"),
    path("reset-password/", reset_password, name="reset_password"),
]
