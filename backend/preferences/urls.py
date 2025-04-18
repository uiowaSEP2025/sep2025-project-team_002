from django.urls import path
from .views import CreatePreferencesView, UserPreferencesView, UpdatePreferencesView

urlpatterns = [
    path("preferences-form/", CreatePreferencesView.as_view(), name="preferences-form"),
    path("user-preferences/", UserPreferencesView.as_view(), name="user-preferences"),
    path(
        "preferences-form/<int:id>/",
        UpdatePreferencesView.as_view(),
        name="update-preferences",
    ),
]
