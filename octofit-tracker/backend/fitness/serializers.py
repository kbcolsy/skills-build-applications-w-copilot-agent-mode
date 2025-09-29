from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, ExerciseType, WorkoutEvent

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'grade_level', 'academic_year']

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                if user.is_active:
                    data['user'] = user
                    return data
                else:
                    raise serializers.ValidationError("User account is disabled.")
            else:
                raise serializers.ValidationError("Invalid credentials.")
        else:
            raise serializers.ValidationError("Must include username and password.")

class ExerciseTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExerciseType
        fields = ['id', 'name', 'description']

class WorkoutEventSerializer(serializers.ModelSerializer):
    exercise_type_name = serializers.CharField(source='exercise_type.name', read_only=True)
    
    class Meta:
        model = WorkoutEvent
        fields = ['id', 'exercise_type', 'exercise_type_name', 'intensity', 'duration_minutes', 'date', 'notes']
        read_only_fields = ['date']