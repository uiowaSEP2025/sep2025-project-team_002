# Generated by Django 5.1.7 on 2025-03-24 17:20

import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Preferences",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "preference_id",
                    models.UUIDField(default=uuid.uuid4, editable=False, unique=True),
                ),
                ("sport", models.CharField(max_length=255)),
                ("head_coach", models.IntegerField()),
                ("assistant_coaches", models.IntegerField()),
                ("team_culture", models.IntegerField()),
                ("campus_life", models.IntegerField()),
                ("athletic_facilities", models.IntegerField()),
                ("athletic_department", models.IntegerField()),
                ("player_development", models.IntegerField()),
                ("nil_opportunity", models.IntegerField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
    ]
