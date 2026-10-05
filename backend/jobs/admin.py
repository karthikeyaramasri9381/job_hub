from django.contrib import admin
from .models import Job, SavedJob


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'created_by', 'employment_type', 'work_mode', 'status', 'created_at')
    list_filter = ('status', 'employment_type', 'work_mode', 'experience_level')
    search_fields = ('title', 'description', 'company__name', 'location')


@admin.register(SavedJob)
class SavedJobAdmin(admin.ModelAdmin):
    list_display = ('candidate', 'job', 'created_at')
