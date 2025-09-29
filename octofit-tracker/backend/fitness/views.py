from django.shortcuts import render
from django.contrib.auth import login, logout
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import User, ExerciseType, WorkoutEvent
from .serializers import UserSerializer, LoginSerializer, ExerciseTypeSerializer, WorkoutEventSerializer

# Create your views here.

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Login endpoint"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        login(request, user)
        user_data = UserSerializer(user).data
        return Response({
            'message': 'Login successful',
            'user': user_data
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Logout endpoint"""
    logout(request)
    return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """Get current user profile"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    """Dashboard data for the current user"""
    user = request.user
    workouts = WorkoutEvent.objects.filter(user=user).order_by('-date')[:10]
    total_workouts = WorkoutEvent.objects.filter(user=user).count()
    
    return Response({
        'total_workouts': total_workouts,
        'recent_workouts': WorkoutEventSerializer(workouts, many=True).data,
        'user': UserSerializer(user).data
    })

class ExerciseTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ExerciseType.objects.all()
    serializer_class = ExerciseTypeSerializer
    permission_classes = [IsAuthenticated]

class WorkoutEventViewSet(viewsets.ModelViewSet):
    serializer_class = WorkoutEventSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return WorkoutEvent.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
