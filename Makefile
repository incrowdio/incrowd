all: clean test www

prod: clean test www_prod link_libs

upload: docker_upload

#docker: docker_build docker_run

shell: docker_build docker_shell

dev: docker_build docker_run

test: pep8 test_django

ci: docker_build_ci docker_run_tests integration

promote: docker_promote

#########################
# Dev tools
#########################

# Build dev container
docker_build:
	cd incrowd && docker build -t incrowd .

# Push the container as a testing release
docker_upload:
	docker build -t incrowd/incrowd:testing .
	docker push incrowd/incrowd:testing

# Push the container as a release
docker_promote:
	docker build -t incrowd/incrowd .
	docker push incrowd/incrowd

# Run the basic set up and run a dev server in the dev container
docker_run:
	docker run -i -v `pwd`/incrowd:/home/docker/code -p 8000:8000 -t incrowd /bin/bash -c "make docker_dev"

# Get a shell inside a dev container
docker_shell:
	docker run -i -v `pwd`/incrowd:/home/docker/code -t incrowd /bin/bash

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

# Build testing container
docker_build_ci:
	docker build -t incrowd/incrowd:testing .

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

# Run integration tests
integration:
	./tests/integration.sh

#########################
# Frontend tools
#########################

# TODO(pcsforeducation) Add the important gulp tasks here
lint:
	cd incrowd/frontend && gulp lint

#########################
# CI/CD tools
#########################

# Prepare to run frontend tests
install_ci:
	npm install -g bower grunt grunt-cli
