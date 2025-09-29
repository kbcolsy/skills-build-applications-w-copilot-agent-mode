from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, ExerciseType, WorkoutEvent, UserStats

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('user_type', 'grade_level', 'academic_year', 'is_archived')
        }),
    )
    list_display = ('username', 'email', 'user_type', 'grade_level', 'academic_year', 'is_archived')
    list_filter = ('user_type', 'academic_year', 'is_archived')

@admin.register(ExerciseType)
class ExerciseTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

@admin.register(WorkoutEvent)
class WorkoutEventAdmin(admin.ModelAdmin):
    list_display = ('user', 'exercise_type', 'intensity', 'duration_minutes', 'date_completed')
    list_filter = ('exercise_type', 'intensity', 'date_completed')
    search_fields = ('user__username',)

@admin.register(UserStats)
class UserStatsAdmin(admin.ModelAdmin):
    list_display = ('user', 'total_workouts', 'total_minutes', 'average_intensity', 'last_workout')
    readonly_fields = ('total_workouts', 'total_minutes', 'average_intensity', 'last_workout', 'updated_at')
