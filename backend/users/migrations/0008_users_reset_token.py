# Generated by Django 5.1.6 on 2025-02-14 20:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0007_users_transfer_type"),
    ]

    operations = [
        migrations.AddField(
            model_name="users",
            name="reset_token",
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
