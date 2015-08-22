#########################
# Entrypoints
#########################

# Build a container and run the backend server
dev: docker_build_testing docker_run

# Build a container and drop to the shell in the container
shell: docker_build_testing docker_shell

# Upload the testing container
upload: docker_upload

# Promote the testing container to prod
promote: docker_promote

# Run backend tests
test: pep8 test_django

# Single entrypoint for CI
ci: docker_build_testing docker_run_tests integration


#########################
# Dev tools
#########################

# Build dev container

docker_build_testing:
	docker build -t incrowd/incrowd:testing .

docker_build:
	docker build -t incrowd/incrowd .

# Build and start the testing container
docker_testing: docker_build_testing
	docker run -i -v `pwd`/incrowd/config:/home/docker/code/config -p 8000:80 -t incrowd/incrowd:testing

# Push the container as a testing release
docker_upload: docker_build_testing
	docker push incrowd/incrowd:testing

# Push the container as a release
docker_promote: docker_build
	docker push incrowd/incrowd

# Run the basic set up and run a dev server in the dev container
docker_run:
	docker run -i -v `pwd`/incrowd:/home/docker/code -v `pwd`/incrowd/config:/home/docker/code/config -e SETTINGS_MODE=testing -p 8000:8000 -t incrowd/incrowd:testing /bin/bash -c "make docker_dev"

# Get a shell inside a dev container
docker_shell:
	docker run -i -v `pwd`/incrowd:/home/docker/code -v `pwd`/incrowd/config:/home/docker/code/config -t incrowd/incrowd:testing /bin/bash

# Build frontend dependencies
frontend_install:
	cd incrowd/frontend && npm install gulp bower
	cd incrowd/frontend && npm install
	cd incrowd/frontend && bower install

# Serve the frontend via gulp for dev
serve:
	cd incrowd/frontend && gulp serve

# Dump current DB data that will be loaded when users first runs inCrowd
create_getting_started:
	python manage.py dumpdata  --natural \
               --indent=4 \
               -e sessions \
               -e admin \
               -e rest_framework \
               -e authtoken.token \
               -e contenttypes \
               -e auth.Permission > getting_started_data.json

# Load getting started data into database
load_data:
	python manage.py loaddata getting_started_data.json

#########################
# Testing tools
#########################

# Run containers inside the testing container
docker_run_tests:
	docker run -e DB_ADDR=$(DB_ADDR) -t incrowd/incrowd:testing /bin/bash -c "make test"

# Run Python style tests outside container
pep8:
	cd incrowd && flake8 api
	cd incrowd && flake8 chat_server
	cd incrowd && flake8 incrowd
	cd incrowd && flake8 fantasy_football
	cd incrowd && flake8 invite_only
	cd incrowd && flake8 notify
	cd incrowd && flake8 poll
	cd incrowd && flake8 push
	cd incrowd && flake8 website

# Run Django tests outside container
test_django:
	cd incrowd && python manage.py test --noinput

#########################
# Frontend tools
#########################

# TODO(pcsforeducation) Add the important gulp tasks here
lint:
	cd incrowd/frontend && gulp lint

frontend_preprod:
	cd incrowd/frontend && gulp build
	cd incrowd/frontend && gulp preprod

frontend_prod:
	cd incrowd/frontend && gulp build
	cd incrowd/frontend && gulp prod

#########################
# CI/CD tools
#########################

# Prepare to run frontend tests
install_ci:
	npm install -g bower grunt grunt-cli

integration:
	bash tests/integration.sh
