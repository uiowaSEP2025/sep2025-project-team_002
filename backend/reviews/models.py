from django.db import models
from django.conf import settings
from schools.models import Schools
import uuid


class Reviews(models.Model):
    review_id = models.UUIDField(default=uuid.uuid4, editable=False)
    school = models.ForeignKey(Schools, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    sport = models.CharField(max_length=50)
    head_coach_name = models.CharField(max_length=100)
    review_message = models.TextField()
    head_coach = models.IntegerField()
    assistant_coaches = models.IntegerField()
    team_culture = models.IntegerField()
    campus_life = models.IntegerField()
    athletic_facilities = models.IntegerField()
    athletic_department = models.IntegerField()
    player_development = models.IntegerField()
    nil_opportunity = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    coach_no_longer_at_university = models.BooleanField(default=False)
    coach_history = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        verbose_name = "Review"
        verbose_name_plural = "Reviews"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Review by {self.user} for {self.school} - {self.sport}"
