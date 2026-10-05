from django.contrib import admin
from .models import Interview


@admin.register(Interview)
class InterviewAdmin(admin.ModelAdmin):
    list_display = ('application', 'interview_type', 'interview_date', 'interview_time', 'status')
    list_filter = ('interview_type', 'status')
    search_fields = ('application__candidate__user__email', 'interviewer_name')
