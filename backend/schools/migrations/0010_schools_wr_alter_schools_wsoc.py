# Generated by Django 5.2 on 2025-05-01 17:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("schools", "0009_schools_wsoc_alter_schools_ba"),
    ]

    operations = [
        migrations.AddField(
            model_name="schools",
            name="wr",
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name="schools",
            name="wsoc",
            field=models.BooleanField(),
        ),
    ]
