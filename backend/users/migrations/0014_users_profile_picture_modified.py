# Generated by Django 5.1.7 on 2025-03-31 05:15

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0013_alter_users_profile_picture"),
    ]

    operations = [
        migrations.AddField(
            model_name="users",
            name="profile_picture_modified",
            field=models.DateTimeField(
                blank=True, default=django.utils.timezone.now, null=True
            ),
        ),
    ]
