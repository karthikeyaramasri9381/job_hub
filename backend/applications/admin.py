from django.contrib import admin
from .models import Application


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('candidate', 'job', 'status', 'applied_at', 'updated_at')
    list_filter = ('status',)
    search_fields = ('candidate__user__email', 'job__title', 'job__company__name')
