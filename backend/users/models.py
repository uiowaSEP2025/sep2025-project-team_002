from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.db import models
from schools.models import Schools


class CustomUserManager(BaseUserManager):
    def create_user(self, email, first_name, last_name, password=None, transfer_type=None):
        if not email:
            raise ValueError("Users must have an email address")
        email = self.normalize_email(email)
        user = self.model(email=email, first_name=first_name, last_name=last_name, transfer_type=transfer_type)
        user.set_password(password)  # Hash password
        user.save(using=self._db)
        return user

    def create_superuser(self, email, first_name, last_name, password=None):
        user = self.create_user(email, first_name, last_name, password)
        user.is_admin = True
        user.save(using=self._db)
        return user


class Users(AbstractBaseUser, PermissionsMixin):
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)  # Still required, but will be hashed
    role = models.CharField(max_length=255, default="user")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    transfer_out_school = models.ForeignKey(
        Schools,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="transfer_out_school",
    )
    transfer_in_school = models.ForeignKey(
        Schools,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="transfer_in_school",
    )

    transfer_type = models.CharField(max_length=20, null=True, blank=True)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"  # Login will use email instead of username
    REQUIRED_FIELDS = ["first_name", "last_name"]

    def __str__(self):
        return self.first_name
