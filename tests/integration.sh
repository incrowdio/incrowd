# Kill old container (if any)
docker kill incrowd_integration
docker rm incrowd_integration

# Make empty config dir
mkdir -p /tmp/incrowd_integration
rm  /tmp/incrowd_integration/*

set +x

# Create DB
docker run -v /tmp/incrowd_integration:/home/docker/code/config/ incrowd/incrowd:testing python manage.py syncdb --noinput
docker run -v /tmp/incrowd_integration:/home/docker/code/config/ incrowd/incrowd:testing python manage.py migrate

# Start up container
docker run -d --name incrowd_integration -p 8000:8001 -v /tmp/incrowd_integration:/home/docker/code/config/ incrowd/incrowd:testing

# Run some tests
python tests/integration.py

# Clean up
rm -rf /tmp/incrowd_integration

# Celebrate
echo "\o/ tests passed \o/"

