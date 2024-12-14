import pyotp
import qrcode
from django.core.management.base import BaseCommand

from accounts.models import CustomUser, Role


class Command(BaseCommand):
    help = "Create initial roles and admin user"

    def handle(self, *args, **kwargs):
        # Create roles
        roles_to_create = [
            {"name": "admin", "description": "Full system access"},
            {"name": "user", "description": "Regular user access"},
            {"name": "guest", "description": "Guest user access"},
        ]

        for role_data in roles_to_create:
            Role.objects.get_or_create(**role_data)
            self.stdout.write(self.style.SUCCESS(f"Role {role_data['name']} created"))

        # Get admin role
        admin_role = Role.objects.get(name="admin")

        # Create initial admin user with MFA secret
        if not CustomUser.objects.filter(username="admin").exists():
            mfa_secret = pyotp.random_base32()
            admin_user = CustomUser.objects.create_superuser(
                username="admin",
                email="admin@example.com",
                password="AdminPassword123!",
                role=admin_role,
            )
            admin_user.mfa_secret = mfa_secret
            admin_user.save()

            self.stdout.write(self.style.SUCCESS("Admin user created successfully"))

            # Print out MFA provisioning URL for initial setup
            totp = pyotp.TOTP(mfa_secret)
            provisioning_url = totp.provisioning_uri(
                name=admin_user.username, issuer_name="SecureFileShare"
            )
            self.stdout.write(
                self.style.SUCCESS(f"MFA Provisioning URL: {provisioning_url}")
            )
            qr = qrcode.QRCode()
            qr.add_data(provisioning_url)
            qr.print_ascii()
        else:
            self.stdout.write(self.style.WARNING("Admin user already exists"))
