###########################################################################
# These should only be run inside a docker container
###########################################################################

all: clean install test www

prod: clean test www_prod link_libs

upload: prod deploy

docker: docker_build docker_run

docker_dev: check_docker frontend_deps django_db docker_server

clean: clean_www clean_app clean_build

test: pep8 test_django

docker_test: docker_build docker_run_test

#########################
# Dev tools
#########################

check_docker:
	if [ ! -f /.dockerinit ]; then echo "Must be run in Docker container, exiting"; exit 1; fi

# Install frontend dependencies
frontend_deps:
#	cd $(INCROWD_PATH)/frontend && npm install
#	cd $(INCROWD_PATH)/frontend && bower --allow-root --config.interactive=false install

# Initialize the DB
django_db:
	python manage.py syncdb --noinput --no-initial-data
	python manage.py migrate --noinput --no-initial-data
	bash initial_db_load.sh

docker_build:
	docker build -t incrowd .

docker_run:
	docker run -i -v `pwd`:/home/docker/code  -p 8000:8000 -t incrowd /bin/bash

docker_run_test:
	docker run -i -v `pwd`:/home/docker/code  -t incrowd /bin/bash -c "make -C /home/docker/code test"

docker_server:
	if [ -e config/newrelic.ini ]; then \
		echo "Running with NewRelic"; \
		#pip install -r requirements.txt; \
		cd $(INCROWD_PATH) && DJANGO_SETTINGS_MODULE="incrowd.settings" NEW_RELIC_CONFIG_FILE=config/newrelic.ini newrelic-admin run-program python manage.py runserver 0.0.0.0:8000; \
	else \
		#pip install -r requirements.txt; \
		cd $(INCROWD_PATH) && DJANGO_SETTINGS_MODULE="incrowd.settings" python manage.py runserver 0.0.0.0:8000; \
	fi

pep8:
	flake8 chat_server
	flake8 incrowd
	flake8 plugins/fantasy
	flake8 invite_only
	flake8 notify
	flake8 poll
	flake8 push
	flake8 website

test_django:
	python manage.py test

# Dump data that can be loaded
dump_data:
	python manage.py dumpdata  --natural \
               --indent=4 \
               -e sessions \
               -e admin \
               -e rest_framework \
               -e authtoken.token \
               -e contenttypes \
               -e auth.Permission > getting_started_data.json

# Load dev data
load_data:
	python manage.py loaddata getting_started_data.json
