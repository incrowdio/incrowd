set -x

CONFIG_DIR=$(pwd)/tmp/incrowd_integration
DOCKER_CONFIG_DIR=/home/docker/code/config
CONTAINER_NAME=incrowd_integration
HOST=${DOCKER_HOSTNAME:=localhost}
PORT=8000
CONTAINER_START_TIMEOUT=20
# Note(pcsforeducation) not passing yet.
# Kill old container (if any), might error
docker kill $CONTAINER_NAME
docker rm $CONTAINER_NAME

# Make errors fail the script
set -e

# Make empty config dir
rm -rf $CONFIG_DIR
mkdir -p $CONFIG_DIR

# Create blank DB
docker run -v "$CONFIG_DIR":"$DOCKER_CONFIG_DIR" -e DB_NAME="$DOCKER_CONFIG_DIR/db.sqlite" incrowd/incrowd:testing python manage.py migrate --noinput

# Load the initial data
docker run -v "$CONFIG_DIR":"$DOCKER_CONFIG_DIR" -e DB_NAME="$DOCKER_CONFIG_DIR/db.sqlite" incrowd/incrowd:testing python manage.py loaddata getting_started_data.json

# Start up container
docker run -v "$CONFIG_DIR":"$DOCKER_CONFIG_DIR" -e DB_NAME="$DOCKER_CONFIG_DIR/db.sqlite" -p $PORT:80 -d --name $CONTAINER_NAME incrowd/incrowd:testing

# Make sure the container is running
sleep 5
NEXT_WAIT_TIME=0
command="curl http://$HOST:$PORT/api/v1/posts/"
until command || [ $NEXT_WAIT_TIME -eq $CONTAINER_START_TIMEOUT ]; do
   echo "Sleeping $NEXT_WAIT_TIME"
   sleep $(( NEXT_WAIT_TIME++ ))
done

# Run some tests
python tests/integration.py

# Clean up
rm -rf /tmp/incrowd_integration

# Celebrate
echo "\o/ tests passed \o/"
