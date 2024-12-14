#!/bin/bash

# Generate SSL certificates if they don't exist
if [ ! -f /app/certs/server.crt ] || [ ! -f /app/certs/server.key ]; then
    echo "Generating SSL certificates..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /app/certs/server.key -out /app/certs/server.crt -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
    chmod 600 /app/certs/server.key
    chmod 644 /app/certs/server.crt
fi

# Run migrations
echo "Running migrations..."
python manage.py makemigrations
python manage.py makemigrations accounts
python manage.py makemigrations files
python manage.py migrate
python manage.py migrate accounts
python manage.py migrate files
python manage.py create_initial_data

# Start Gunicorn
echo "Starting Gunicorn..."
gunicorn --certfile=/app/certs/server.crt --keyfile=/app/certs/server.key project.wsgi:application -b :8000