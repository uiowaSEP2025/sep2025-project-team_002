from django.db import migrations

class Migration(migrations.Migration):
    dependencies = [
        ('reviews', '0014_remove_duplicate_reviews'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='reviews',
            unique_together={('school', 'user', 'head_coach_name', 'sport')},
        ),
    ] 