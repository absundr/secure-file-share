import os

from .base import *  # noqa: F403

SECRET_KEY = os.environ.get("SECRET_KEY")

DEBUG = False

ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

# Include domain for hosting
_HOST=os.environ.get("HOST")
if _HOST:
    ALLOWED_HOSTS.append(_HOST)

CORS_ORIGIN_WHITELIST = [
    "https://localhost:3001",
]

# SSL/TLS Settings
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_SSL_REDIRECT = True
