from django.http import JsonResponse
from django.contrib.auth.hashers import make_password
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Users
from .serializers import UserSerializer


@csrf_exempt
@api_view(["POST"])
def signup(request):
    data = request.data
    # Validate required fields
    required_fields = ["first_name", "last_name", "email", "password"]
    for field in required_fields:
        if field not in data or not data[field]:
            return Response(
                {"error": f"{field} is required."}, status=status.HTTP_400_BAD_REQUEST
            )
    try:
        # Use the custom manager on your Users model
        user = Users.objects.create_user(
            email=data["email"],
            first_name=data["first_name"],
            last_name=data["last_name"],
            password=data["password"],
            transfer_type=data.get("transfer_type")
        )
        # Optionally, if you want to record transfer info, you can extend this logic:
        # e.g., user.transfer_type = data.get('transfer_type')
        # user.save()
        serializer = UserSerializer(user, many=False)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    current_password = request.data.get("current_password")
    new_password = request.data.get("new_password")

    # 1. Check if current password is correct
    if not user.check_password(current_password):
        return Response({"error": "Current password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)

    # 2. Set the new password
    user.set_password(new_password)
    user.save()

    return Response({"message": "Password changed successfully!"}, status=status.HTTP_200_OK)



def test_api(request):
    return JsonResponse({"message": "Backend is working!"})


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Customize JWT response if needed"""

    def validate(self, attrs):
        data = super().validate(attrs)
        data["first_name"] = self.user.first_name
        data["last_name"] = self.user.last_name
        return data  # Includes first_name and last_name in the token response for extra validation


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def patch(self, request):
        user = request.user
        data = request.data

        # Update fields if present, otherwise leave old value.
        user.first_name = data.get("first_name", user.first_name)
        user.last_name = data.get("last_name", user.last_name)
        user.email = data.get("email", user.email)
        # Make sure you have a transfer_type field in your model
        user.transfer_type = data.get("transfer_type", user.transfer_type)

        user.save()

        # Return updated user data
        serializer = UserSerializer(user)
        return Response(serializer.data, status=200)
