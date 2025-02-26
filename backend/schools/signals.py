from django.core.management import call_command
from django.db.models.signals import post_migrate
from django.dispatch import receiver
from schools.models import Schools

@receiver(post_migrate)
def load_initial_data(sender, **kwargs):
    if sender.name == "schools":
        if not Schools.objects.exists():
            print("Auto-loading fixture data...")
            call_command("loaddata", "schools/fixtures/big10.json")