import uuid
from django.db import models
from schools.models import Schools
from users.models import Users


class Reviews(models.Model):
    review_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    school = models.ForeignKey(Schools, on_delete=models.CASCADE)
    user = models.ForeignKey(Users, on_delete=models.CASCADE)
    sport = models.CharField(max_length=255)
    head_coach_name = models.TextField()
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

    def __str__(self):
        return f"Review {self.review_id} for {self.school.school_name}"

class ReviewVote(models.Model):
    VOTE_CHOICES = [
        (1, 'helpful'),
        (0, 'unhelpful'),
    ]

    review = models.ForeignKey('Reviews', on_delete=models.CASCADE, related_name='votes')
    user = models.ForeignKey(Users, on_delete=models.CASCADE)  # or settings.AUTH_USER_MODEL
    vote = models.IntegerField(choices=VOTE_CHOICES)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('review', 'user')
        indexes = [
            models.Index(fields=['review', 'user']),
        ]

    def __str__(self):
        return f"{self.user} voted {self.get_vote_display()} on {self.review}"