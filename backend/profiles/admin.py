from django.contrib import admin
from .models import CandidateProfile, RecruiterProfile, Skill, CandidateSkill, Education, Experience


@admin.register(CandidateProfile)
class CandidateProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'full_name', 'headline', 'phone', 'location', 'created_at')
    search_fields = ('user__email', 'full_name', 'headline', 'location')


@admin.register(RecruiterProfile)
class RecruiterProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'company', 'designation', 'phone', 'created_at')
    search_fields = ('user__email', 'designation', 'company__name')


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)


@admin.register(CandidateSkill)
class CandidateSkillAdmin(admin.ModelAdmin):
    list_display = ('candidate', 'skill', 'skill_level')
    list_filter = ('skill_level',)


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ('candidate', 'degree', 'institution', 'start_date', 'end_date')


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ('candidate', 'job_title', 'company_name', 'start_date', 'end_date')
