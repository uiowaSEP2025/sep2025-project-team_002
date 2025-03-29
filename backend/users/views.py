from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.core.mail import send_mail
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from .tokens import school_email_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from .serializers import UserSerializer
from .models import Users
import re
from django.db import IntegrityError
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework.exceptions import AuthenticationFailed


token_generator = PasswordResetTokenGenerator()


@csrf_exempt
@api_view(["POST"])
def signup(request):
    data = request.data
    required_fields = ["first_name", "last_name", "email", "password"]
    for field in required_fields:
        if field not in data or not data[field]:
            return Response(
                {"error": f"{field} is required."}, status=status.HTTP_400_BAD_REQUEST
            )

    # Email format check
    if not is_valid_email(data["email"]):
        return Response(
            {"error": "Invalid email format."}, status=status.HTTP_400_BAD_REQUEST
        )

    # Password strength check
    if not is_strong_password(data["password"]):
        return Response(
            {
                "error": "Password is not strong enough. Must be >=6 chars, with upper, lower, and digit."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        user = Users.objects.create_user(
            email=data["email"],
            first_name=data["first_name"],
            last_name=data["last_name"],
            password=data["password"],
            transfer_type=data.get("transfer_type"),
        )

        serializer = UserSerializer(user, many=False)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    except IntegrityError:
        # Specifically handle duplicate email
        return Response(
            {"error": "An account with this email already exists."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    except Exception as e:
        # Handle other unexpected errors
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    current_password = request.data.get("current_password")
    new_password = request.data.get("new_password")

    # 1. Check current password
    if not user.check_password(current_password):
        return Response(
            {"error": "Current password is incorrect."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # 2. Validate new password
    if not is_strong_password(new_password):
        return Response(
            {
                "error": "New password is not strong enough. Must be >=6 chars, with upper, lower, and digit."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # 3. Set the new password
    user.set_password(new_password)
    user.save()

    return Response(
        {"message": "Password changed successfully!"}, status=status.HTTP_200_OK
    )


@api_view(["POST"])
def forgot_password(request):
    email = request.data.get("email")
    if not email:
        return Response(
            {"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST
        )
    try:
        user = Users.objects.get(email=email)
    except Users.DoesNotExist:
        return Response(
            {"error": "Unregistered Email Address!"}, status=status.HTTP_400_BAD_REQUEST
        )

    # Generate uid and token
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = token_generator.make_token(user)

    """Check: work for production env?"""
    reset_url = request.build_absolute_uri(f"/reset-password/?uid={uid}&token={token}")
    if settings.DEBUG:
        reset_url = reset_url.replace("localhost:8000", "localhost:3000")

    # Send Email
    send_mail(
        subject="Password Reset Request",
        message=(
            f"Hello, this is Athletic Insider! \n,"
            f"Please click the following link to reset your password,"
            f"\n {reset_url} \n,"
            f"The link is valid for one hour."
        ),
        from_email="noreply@example.com",
        recipient_list=[email],
        fail_silently=False,
    )
    return Response({"message": "An email has been sent!"}, status=status.HTTP_200_OK)


@api_view(["POST"])
def reset_password(request):
    uidb64 = request.data.get("uid")
    token = request.data.get("token")
    new_password = request.data.get("new_password")
    confirm_password = request.data.get("confirm_password")

    if not all([uidb64, token, new_password, confirm_password]):
        return Response(
            {"error": "Please Fill Out the Form!"}, status=status.HTTP_400_BAD_REQUEST
        )
    if new_password != confirm_password:
        return Response(
            {"error": "Passwords don't match."}, status=status.HTTP_400_BAD_REQUEST
        )
    if not is_strong_password(new_password):
        return Response(
            {"error": "Use Strong Password!"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = Users.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, Users.DoesNotExist):
        return Response({"error": "Invalid Link!"}, status=status.HTTP_400_BAD_REQUEST)

    if not token_generator.check_token(user, token):
        return Response(
            {"error": "Link is invalid or expired!"}, status=status.HTTP_400_BAD_REQUEST
        )

    user.set_password(new_password)
    user.save()
    return Response(
        {"message": "Successfully reset the password!"}, status=status.HTTP_200_OK
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_school_verification(request):
    user = request.user
    email = user.email
    domain = email.split("@")[1].lower()

    if not domain.endswith(".edu"):
        return Response(
            {"error": "Only .edu emails can be verified."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = school_email_token_generator.make_token(user)

    verify_url = request.build_absolute_uri(
        f"/verify-school-email/?uid={uid}&token={token}"
    )
    if settings.DEBUG:
        verify_url = verify_url.replace("localhost:8000", "localhost:3000")

    send_mail(
        subject="Verify Your School Email",
        message=(
            f"Hi {user.first_name},\n\n"
            f"Click the link below to verify your school email:\n{verify_url}\n\n"
            f"This link is valid for a limited time."
        ),
        from_email="noreply@yourapp.com",
        recipient_list=[email],
    )

    return Response({"message": "Verification email sent!"})


@api_view(["POST"])
def verify_school_email(request):
    uidb64 = request.data.get("uid")
    token = request.data.get("token")

    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = Users.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, Users.DoesNotExist):
        return Response(
            {"error": "Invalid verification link."}, status=status.HTTP_400_BAD_REQUEST
        )

    if not school_email_token_generator.check_token(user, token):
        return Response(
            {"error": "Verification link is expired or invalid."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.is_school_verified = True
    user.save()
    return Response(
        {"message": "School email verified successfully!"}, status=status.HTTP_200_OK
    )


def test_api(request):
    return JsonResponse({"message": "Backend is working!"})


# For CI tests
def healthcheck(request):
    return JsonResponse({"status": "ok"})


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        try:
            data = super().validate(attrs)
            # Add extra fields if you want
            data["first_name"] = self.user.first_name
            data["last_name"] = self.user.last_name
            return data
        except AuthenticationFailed:
            raise AuthenticationFailed("Invalid email or password. Please try again.")
        except TokenError as e:
            raise AuthenticationFailed("Invalid token or credentials.")


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

        # If user is trying to change email, validate
        if "email" in data:
            new_email = data["email"].strip()
            if not is_valid_email(new_email):
                return Response(
                    {"error": "Invalid email format."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            # If email is valid, check for uniqueness (if needed)
            # if Users.objects.exclude(pk=user.pk).filter(email=new_email).exists():
            #     return Response({"error": "Email already taken."}, status=400)
            if new_email != user.email.lower():
                user.email = new_email
                user.is_school_verified = False

        # If user wants to update other fields:
        user.first_name = data.get("first_name", user.first_name)
        user.last_name = data.get("last_name", user.last_name)
        user.transfer_type = data.get("transfer_type", user.transfer_type)

        if "profile_picture" in data:
            profile_picture = data["profile_picture"]
            if profile_picture not in dict(Users.PROFILE_PICTURE_CHOICES):
                return Response(
                    {"error": "Invalid profile picture choice."}, status=400
                )

        user.save()

        serializer = UserSerializer(user)
        return Response(serializer.data, status=200)


def is_valid_email(email: str) -> bool:
    """Simple regex-based check for email format."""
    pattern = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"
    return bool(re.match(pattern, email))


def is_strong_password(password: str) -> bool:
    """
    Check if `password` meets your policy:
    - Length >= 6
    - Has at least one uppercase, one lowercase, one digit
    """
    if len(password) < 6:
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"[a-z]", password):
        return False
    if not re.search(r"\d", password):
        return False
    return True
