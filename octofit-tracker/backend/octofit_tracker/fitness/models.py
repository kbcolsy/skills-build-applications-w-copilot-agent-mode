from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class User(AbstractUser):
    """
    Custom user model for Mergington High School Fitness Tracker
    """
    USER_TYPES = (
        ('student', 'Student'),
        ('teacher', 'Teacher/Admin'),
    )
    
    user_type = models.CharField(max_length=10, choices=USER_TYPES, default='student')
    grade_level = models.CharField(max_length=20, blank=True, null=True)
    academic_year = models.CharField(max_length=9, default='2024-2025')  # Format: 2024-2025
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"

class ExerciseType(models.Model):
    """
    Different types of exercises available
    """
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name

class WorkoutEvent(models.Model):
    """
    Individual workout events logged by students
    """
    INTENSITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('very_high', 'Very High'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workout_events')
    exercise_type = models.ForeignKey(ExerciseType, on_delete=models.CASCADE)
    intensity = models.CharField(max_length=10, choices=INTENSITY_CHOICES)
    duration_minutes = models.PositiveIntegerField(help_text="Duration in minutes")
    date_completed = models.DateTimeField(default=timezone.now)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date_completed']
    
    def __str__(self):
        return f"{self.user.username} - {self.exercise_type.name} ({self.intensity})"

class UserStats(models.Model):
    """
    Aggregated statistics for each user
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='stats')
    total_workouts = models.PositiveIntegerField(default=0)
    total_minutes = models.PositiveIntegerField(default=0)
    average_intensity = models.FloatField(default=0.0)
    favorite_exercise = models.ForeignKey(ExerciseType, on_delete=models.SET_NULL, null=True, blank=True)
    last_workout = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Stats for {self.user.username}"
