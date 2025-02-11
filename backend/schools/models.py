from django.db import models
from django.utils import timezone


class Schools(models.Model):
    school_name = models.CharField(max_length=255)
    mbb = models.BooleanField()
    wbb = models.BooleanField()
    fb = models.BooleanField()
    conference = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name_plural = "Schools"

    def save(self, *args, **kwargs):
        if not self.created_at:
            self.created_at = timezone.now()
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.school_name
