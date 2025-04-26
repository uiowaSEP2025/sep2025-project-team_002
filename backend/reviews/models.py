from django.db import models
from django.conf import settings
from schools.models import Schools
from users.models import Users
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


class ReviewVote(models.Model):
    VOTE_CHOICES = [
        (1, "helpful"),
        (0, "unhelpful"),
    ]

    review = models.ForeignKey(
        "Reviews", on_delete=models.CASCADE, related_name="votes"
    )
    user = models.ForeignKey(
        Users, on_delete=models.CASCADE
    )  # or settings.AUTH_USER_MODEL
    vote = models.IntegerField(choices=VOTE_CHOICES)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("review", "user")
        indexes = [
            models.Index(fields=["review", "user"]),
        ]

    def __str__(self):
        return f"{self.user} voted {self.get_vote_display()} on {self.review}"
