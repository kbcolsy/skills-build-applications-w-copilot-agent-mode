from django.core.management.base import BaseCommand
from fitness.models import User, ExerciseType

class Command(BaseCommand):
    help = 'Load initial data for the fitness app'

    def handle(self, *args, **options):
        # Create exercise types
        exercise_types = [
            {'name': 'Running', 'description': 'Cardiovascular running exercise'},
            {'name': 'Push-ups', 'description': 'Upper body strength exercise'},
            {'name': 'Basketball', 'description': 'Team sport activity'},
            {'name': 'Swimming', 'description': 'Full body aquatic exercise'},
            {'name': 'Weightlifting', 'description': 'Resistance training'},
            {'name': 'Yoga', 'description': 'Flexibility and mindfulness'},
            {'name': 'Soccer', 'description': 'Team sport activity'},
            {'name': 'Cycling', 'description': 'Cardiovascular cycling exercise'},
        ]
        
        for exercise_data in exercise_types:
            exercise, created = ExerciseType.objects.get_or_create(
                name=exercise_data['name'],
                defaults={'description': exercise_data['description']}
            )
            if created:
                self.stdout.write(f'Created exercise type: {exercise.name}')
            else:
                self.stdout.write(f'Exercise type already exists: {exercise.name}')
        
        # Create test users
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@mergington.edu',
                'first_name': 'Coach',
                'last_name': 'Johnson',
                'role': 'teacher',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write('Created admin user (admin/admin123)')
        
        student_user, created = User.objects.get_or_create(
            username='student1',
            defaults={
                'email': 'student1@mergington.edu',
                'first_name': 'Alex',
                'last_name': 'Smith',
                'role': 'student',
                'grade_level': 11,
            }
        )
        if created:
            student_user.set_password('student123')
            student_user.save()
            self.stdout.write('Created student user (student1/student123)')
        
        self.stdout.write(self.style.SUCCESS('Initial data loaded successfully!'))