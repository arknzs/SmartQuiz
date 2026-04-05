#!/bin/bash

python ./manage.py collectstatic --noinput
gunicorn --bind localhost:8200 --log-level warning Voter_hak.wsgi:application