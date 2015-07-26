#!/bin/bash
set -e

# Collect REST API and admin staticfiles
python manage.py collectstatic --noinput

# Run migrations
python manage.py migrate --noinput

# Load initial data if necessary
bash initial_db_load.sh

# Allow users to input their own uwsgi.ini
if [[ -e /home/docker/code/config/uwsgi.ini ]]; then
    /usr/local/bin/uwsgi --ini /home/docker/code/config/uwsgi.ini;
else
    /usr/local/bin/uwsgi --ini /home/docker/code/uwsgi.ini;
fi
