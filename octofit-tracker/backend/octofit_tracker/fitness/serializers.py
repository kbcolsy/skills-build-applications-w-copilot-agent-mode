from rest_framework import serializers
from .models import User, ExerciseType, WorkoutEvent, UserStats

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 
                 'user_type', 'grade_level', 'academic_year', 'password')
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

class ExerciseTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExerciseType
        fields = '__all__'

class WorkoutEventSerializer(serializers.ModelSerializer):
    exercise_type_name = serializers.CharField(source='exercise_type.name', read_only=True)
    
    class Meta:
        model = WorkoutEvent
        fields = ('id', 'user', 'exercise_type', 'exercise_type_name', 
                 'intensity', 'duration_minutes', 'date_completed', 'notes', 'created_at')
        read_only_fields = ('user', 'created_at')

class WorkoutEventCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkoutEvent
        fields = ('exercise_type', 'intensity', 'duration_minutes', 'date_completed', 'notes')

class UserStatsSerializer(serializers.ModelSerializer):
    favorite_exercise_name = serializers.CharField(source='favorite_exercise.name', read_only=True)
    
    class Meta:
        model = UserStats
        fields = ('user', 'total_workouts', 'total_minutes', 'average_intensity', 
                 'favorite_exercise', 'favorite_exercise_name', 'last_workout', 'updated_at')
        read_only_fields = ('user', 'total_workouts', 'total_minutes', 'average_intensity', 
                           'favorite_exercise', 'last_workout', 'updated_at')

class UserProfileSerializer(serializers.ModelSerializer):
    stats = UserStatsSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 
                 'user_type', 'grade_level', 'academic_year', 'stats')
        read_only_fields = ('id', 'username', 'user_type')