from django.urls import path
from .views import CreatePreferencesView, UserPreferencesView

urlpatterns = [
    path("preferences-form/", CreatePreferencesView.as_view(), name="preferences-form"),
    path("user-preferences/", UserPreferencesView.as_view(), name="user-preferences"),
]

