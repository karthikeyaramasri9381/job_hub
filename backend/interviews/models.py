from django.db import models
from applications.models import Application


class Interview(models.Model):
    class Type(models.TextChoices):
        VIDEO = 'VIDEO', 'Video'
        PHONE = 'PHONE', 'Phone'
        IN_PERSON = 'IN_PERSON', 'In Person'

    class Status(models.TextChoices):
        SCHEDULED = 'SCHEDULED', 'Scheduled'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'
        RESCHEDULED = 'RESCHEDULED', 'Rescheduled'

    application = models.ForeignKey(
        Application,
        on_delete=models.CASCADE,
        related_name='interviews'
    )
    interview_type = models.CharField(
        max_length=20,
        choices=Type.choices,
        default=Type.VIDEO
    )
    interview_date = models.DateField()
    interview_time = models.TimeField()
    meeting_link = models.URLField(max_length=500, blank=True)
    interviewer_name = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SCHEDULED
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Interview for {self.application.candidate.user.email} on {self.interview_date} ({self.status})"
