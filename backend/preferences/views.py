from rest_framework import generics, permissions
from .models import Preferences
from .serializers import PreferencesSerializer


class CreatePreferencesView(generics.CreateAPIView):
    queryset = Preferences.objects.all()
    serializer_class = PreferencesSerializer
    permission_classes = [permissions.IsAuthenticated]  # Require JWT authentication

    def perform_create(self, serializer):
        Preferences.objects.filter(user=self.request.user).delete()
        serializer.save(user=self.request.user)  # Assign the logged-in user


class UserPreferencesView(generics.ListAPIView):
    serializer_class = PreferencesSerializer
    permission_classes = [permissions.IsAuthenticated]  # Require JWT authentication

    def get_queryset(self):
        return Preferences.objects.filter(user=self.request.user)

class UpdatePreferencesView(generics.RetrieveUpdateAPIView):
    serializer_class = PreferencesSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return Preferences.objects.filter(user=self.request.user)

    def get_object(self):
        # Get the user's preference (there should only be one)
        queryset = self.get_queryset()
        obj = generics.get_object_or_404(queryset)
        return obj
