# Generated by Django 5.2 on 2025-04-30 16:46

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("schools", "0005_alter_schools_vb"),
    ]

    operations = [
        migrations.RenameField(
            model_name="schools",
            old_name="vb",
            new_name="wvb",
        ),
    ]
