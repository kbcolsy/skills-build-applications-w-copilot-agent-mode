from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Avg, Sum
from django.utils import timezone
from datetime import datetime, timedelta
from .models import User, ExerciseType, WorkoutEvent, UserStats
from .serializers import (
    UserSerializer, ExerciseTypeSerializer, WorkoutEventSerializer, 
    WorkoutEventCreateSerializer, UserStatsSerializer, UserProfileSerializer
)

class ExerciseTypeListView(generics.ListAPIView):
    queryset = ExerciseType.objects.all()
    serializer_class = ExerciseTypeSerializer
    permission_classes = [IsAuthenticated]

class WorkoutEventListCreateView(generics.ListCreateAPIView):
    serializer_class = WorkoutEventSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return WorkoutEvent.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return WorkoutEventCreateSerializer
        return WorkoutEventSerializer
    
    def perform_create(self, serializer):
        workout = serializer.save(user=self.request.user)
        self.update_user_stats(self.request.user)
    
    def update_user_stats(self, user):
        stats, created = UserStats.objects.get_or_create(user=user)
        
        # Calculate total workouts and minutes
        workouts = WorkoutEvent.objects.filter(user=user)
        stats.total_workouts = workouts.count()
        stats.total_minutes = workouts.aggregate(Sum('duration_minutes'))['duration_minutes__sum'] or 0
        
        # Calculate average intensity
        intensity_map = {'low': 1, 'medium': 2, 'high': 3, 'very_high': 4}
        intensities = [intensity_map.get(w.intensity, 1) for w in workouts]
        stats.average_intensity = sum(intensities) / len(intensities) if intensities else 0
        
        # Find favorite exercise
        favorite = workouts.values('exercise_type').annotate(
            count=Count('exercise_type')
        ).order_by('-count').first()
        
        if favorite:
            stats.favorite_exercise_id = favorite['exercise_type']
        
        # Last workout
        stats.last_workout = workouts.first().date_completed if workouts.exists() else None
        stats.save()

class WorkoutEventDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WorkoutEventSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return WorkoutEvent.objects.filter(user=self.request.user)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        # Ensure user stats exist
        UserStats.objects.get_or_create(user=self.request.user)
        return self.request.user

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_dashboard_stats(request):
    """
    Get dashboard statistics for the current user
    """
    user = request.user
    stats, created = UserStats.objects.get_or_create(user=user)
    
    # Recent workouts (last 7 days)
    recent_workouts = WorkoutEvent.objects.filter(
        user=user,
        date_completed__gte=timezone.now() - timedelta(days=7)
    ).count()
    
    # Weekly progress
    weekly_data = []
    for i in range(7):
        date = timezone.now() - timedelta(days=i)
        count = WorkoutEvent.objects.filter(
            user=user,
            date_completed__date=date.date()
        ).count()
        weekly_data.append({
            'date': date.date(),
            'workouts': count
        })
    
    return Response({
        'total_workouts': stats.total_workouts,
        'total_minutes': stats.total_minutes,
        'average_intensity': stats.average_intensity,
        'recent_workouts': recent_workouts,
        'weekly_data': weekly_data,
        'favorite_exercise': stats.favorite_exercise.name if stats.favorite_exercise else None
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_stats(request):
    """
    Admin-only view for overall statistics
    """
    if request.user.user_type != 'teacher':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    # Overall stats
    total_students = User.objects.filter(user_type='student', is_archived=False).count()
    total_workouts = WorkoutEvent.objects.count()
    total_minutes = WorkoutEvent.objects.aggregate(Sum('duration_minutes'))['duration_minutes__sum'] or 0
    
    # Most popular exercises
    popular_exercises = WorkoutEvent.objects.values('exercise_type__name').annotate(
        count=Count('exercise_type')
    ).order_by('-count')[:5]
    
    # Students by grade
    grade_stats = User.objects.filter(user_type='student', is_archived=False).values('grade_level').annotate(
        count=Count('id')
    ).order_by('grade_level')
    
    return Response({
        'total_students': total_students,
        'total_workouts': total_workouts,
        'total_minutes': total_minutes,
        'popular_exercises': popular_exercises,
        'grade_stats': grade_stats
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_list(request):
    """
    Admin-only view to list all students
    """
    if request.user.user_type != 'teacher':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    students = User.objects.filter(user_type='student').select_related('stats')
    serializer = UserProfileSerializer(students, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def archive_user(request, user_id):
    """
    Admin-only view to archive a user by academic year
    """
    if request.user.user_type != 'teacher':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id, user_type='student')
        user.is_archived = True
        user.save()
        return Response({'message': 'User archived successfully'})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
