# Generated by Django 5.1.6 on 2025-02-13 23:38

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("reviews", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="reviews",
            name="review_id",
            field=models.CharField(
                default=uuid.uuid4, editable=False, max_length=255, unique=True
            ),
        ),
    ]
