from django.urls import path
from . import views

urlpatterns = [
    # Exercise types
    path('exercises/', views.ExerciseTypeListView.as_view(), name='exercise-list'),
    
    # Workout events
    path('workouts/', views.WorkoutEventListCreateView.as_view(), name='workout-list-create'),
    path('workouts/<int:pk>/', views.WorkoutEventDetailView.as_view(), name='workout-detail'),
    
    # User profile and stats
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('dashboard/', views.user_dashboard_stats, name='dashboard-stats'),
    
    # Admin endpoints
    path('admin/stats/', views.admin_stats, name='admin-stats'),
    path('admin/students/', views.student_list, name='student-list'),
    path('admin/archive/<int:user_id>/', views.archive_user, name='archive-user'),
]