#!/bin/sh
set -e

mkdir -p /data/static /data/media

if [ "${SKIP_DJANGO_BOOTSTRAP:-0}" != "1" ]; then
    python manage.py migrate --noinput
    python manage.py collectstatic --noinput
fi

exec "$@"
