# Generated by Django 5.2 on 2025-05-01 17:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("schools", "0011_alter_schools_vb"),
    ]

    operations = [
        migrations.AlterField(
            model_name="schools",
            name="ba",
            field=models.BooleanField(default=True),
        ),
        migrations.AlterField(
            model_name="schools",
            name="wsoc",
            field=models.BooleanField(default=True),
        ),
    ]
