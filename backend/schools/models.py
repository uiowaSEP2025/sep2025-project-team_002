from django.db import models
from django.utils import timezone


class Schools(models.Model):
    school_name = models.CharField(max_length=255)
    mbb = models.BooleanField()
    wbb = models.BooleanField()
    fb = models.BooleanField()
    vb = models.BooleanField(default=True)
    ba = models.BooleanField(default=True)
    wsoc = models.BooleanField(default=True)
    wr = models.BooleanField(default=False)
    conference = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)
    review_summaries = models.JSONField(null=True, blank=True, default=dict)
    review_dates = models.JSONField(null=True, blank=True, default=dict)
    review_summary = models.TextField(null=True, blank=True)
    last_review_date = models.DateTimeField(null=True, blank=True)
    sport_summaries = models.JSONField(null=True, blank=True, default=dict)
    sport_review_dates = models.JSONField(null=True, blank=True, default=dict)

    class Meta:
        verbose_name_plural = "Schools"

    def save(self, *args, **kwargs):
        if not self.created_at:
            self.created_at = timezone.now()
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.school_name
