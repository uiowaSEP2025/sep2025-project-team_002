# Generated by Django 5.1.6 on 2025-02-07 17:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0002_remove_schools_school_id_users_session_token_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="users",
            name="role",
            field=models.CharField(default="user", max_length=255),
        ),
    ]
