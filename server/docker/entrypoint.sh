#!/usr/bin/env bash
set -euo pipefail

python manage.py check --database default || true

python manage.py migrate --noinput
python manage.py collectstatic --noinput
# python manage.py createsuperuser --noinput --username admin --email kkwang@outlook.com

exec gunicorn core.wsgi:application --bind 0.0.0.0:8000