from .base import *  # noqa: F403

SECRET_KEY = "super-secret-key-replace-in-prod"

DEBUG = True

ALLOWED_HOSTS = ["*"]

CORS_ORIGIN_WHITELIST = [
    "http://localhost:3000",
]

# SSL/TLS Settings
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
SECURE_SSL_REDIRECT = False
