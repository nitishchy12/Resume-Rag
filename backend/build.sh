#!/usr/bin/env bash
# Build script for Render deployment

set -o errexit  # exit on error

pip install --upgrade pip
pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# Create superuser if it doesn't exist
python manage.py shell -c "
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@hackathon.demo', 'admin123')
    print('Admin user created successfully')
else:
    print('Admin user already exists')
"