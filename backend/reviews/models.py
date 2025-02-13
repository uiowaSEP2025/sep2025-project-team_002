import uuid
from django.db import models
from schools.models import Schools
from users.models import Users


class Reviews(models.Model):
    review_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    school = models.ForeignKey(Schools, on_delete=models.CASCADE)
    user = models.ForeignKey(Users, on_delete=models.CASCADE)
    sport = models.CharField(max_length=255)
    review_message = models.TextField()
    head_coach = models.IntegerField()
    assistant_coaches = models.IntegerField()
    team_culture = models.IntegerField()
    campus_life = models.IntegerField()
    athletic_facilities = models.IntegerField()
    athletic_department = models.IntegerField()
    player_development = models.IntegerField()
    nil_opportunity = models.IntegerField()
    date_of_review = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Review {self.review_id} for {self.school.school_name}"
