from django.http import JsonResponse
import json
from django.contrib.auth.hashers import make_password
from .models import Users
from rest_framework import status
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
# from models import Users
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from .serializers import UserSerializer

@csrf_exempt
@api_view(['POST'])
def signup(request):
    data = request.data
    # Validate required fields
    required_fields = ['first_name', 'last_name', 'email', 'password']
    for field in required_fields:
        if field not in data or not data[field]:
            return Response({"error": f"{field} is required."},
                            status=status.HTTP_400_BAD_REQUEST)
    try:
        # Use the custom manager on your Users model
        user = Users.objects.create_user(
            email=data['email'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            password=data['password']
        )
        # Optionally, if you want to record transfer info, you can extend this logic:
        # e.g., user.transfer_type = data.get('transfer_type')
        # user.save()
        serializer = UserSerializer(user, many=False)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)



def test_api(request):
    return JsonResponse({"message": "Backend is working!"})

class LoginView(TokenObtainPairView):
    """Handles user login and returns JWT tokens"""
    pass


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)
