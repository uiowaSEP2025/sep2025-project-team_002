from django.db import migrations
from django.db.models import Max

def remove_duplicate_reviews(apps, schema_editor):
    Reviews = apps.get_model('reviews', 'Reviews')
    
    # Get all unique combinations of school, user, head_coach_name, and sport
    unique_reviews = Reviews.objects.values('school', 'user', 'head_coach_name', 'sport').annotate(
        max_id=Max('id')
    )
    
    # For each unique combination, keep only the most recent review
    for review in unique_reviews:
        Reviews.objects.filter(
            school=review['school'],
            user=review['user'],
            head_coach_name=review['head_coach_name'],
            sport=review['sport']
        ).exclude(
            id=review['max_id']
        ).delete()

class Migration(migrations.Migration):
    dependencies = [
        ('reviews', '0013_reviewvote'),
    ]

    operations = [
        migrations.RunPython(remove_duplicate_reviews),
    ] 