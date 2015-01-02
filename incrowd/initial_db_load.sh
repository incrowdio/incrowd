#!/bin/bash

# Check if DB has data (any user) in it.
# exit status 1 if users exist, 0 if not
echo 'from website.models import UserProfile; import sys; sys.exit(UserProfile.objects.count() > 0);' | python manage.py shell

if [ "$?" = "0" ]; then
    python manage.py loaddata getting_started_data.json
else
    echo "Data already present, not running initial data load";
fi
