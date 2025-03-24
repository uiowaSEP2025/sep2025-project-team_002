from rest_framework import generics, permissions
from .models import Preferences
from .serializers import PreferencesSerializer

class CreatePreferencesView(generics.CreateAPIView):
    queryset = Preferences.objects.all()
    serializer_class = PreferencesSerializer
    permission_classes = [permissions.IsAuthenticated]  # Require JWT authentication

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)  # Assign the logged-in user


class UserPreferencesView(generics.ListAPIView):
    serializer_class = PreferencesSerializer
    permission_classes = [permissions.IsAuthenticated]  # Require JWT authentication

    def get_queryset(self):
        return Preferences.objects.filter(user=self.request.user)
