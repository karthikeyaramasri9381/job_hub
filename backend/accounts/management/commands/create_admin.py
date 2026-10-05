from django.core.management.base import BaseCommand
from accounts.models import User


class Command(BaseCommand):
    help = 'Create initial admin user if it does not exist'

    def handle(self, *args, **kwargs):
        email = 'admin@jobhub.com'
        password = 'Admin@12345Password!'
        if not User.objects.filter(email=email).exists():
            User.objects.create_superuser(
                email=email,
                password=password,
                first_name='System',
                last_name='Admin',
                role=User.Role.ADMIN
            )
            self.stdout.write(self.style.SUCCESS(f'Successfully created superuser: {email}'))
        else:
            self.stdout.write(self.style.WARNING(f'Superuser {email} already exists.'))
