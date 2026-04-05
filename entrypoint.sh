#!/bin/bash
python manage.py migrate --noinput
python manage.py collectstatic --noinput
# Запуск через gunicorn (установите gunicorn, если его нет в зависимостях)
exec gunicorn Voter_hak.wsgi:application --bind 0.0.0.0:8000 --workers 3