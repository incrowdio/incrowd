all: clean install test www

prod: clean test www_prod link_libs

upload: prod deploy

docker: docker_build docker_run

docker_dev: check_docker frontend_deps django_db docker_server

clean: clean_www clean_app clean_build

test: pep8 test_django

#########################
# Dev tools
#########################

check_docker:
	if [ ! -f /.dockerinit ]; then echo "Must be run in Docker container, exiting"; exit 1; fi

# Install frontend dependencies
frontend_deps:
	cd $(INCROWD_PATH)/frontend && npm install
	cd $(INCROWD_PATH)/frontend && bower --allow-root --config.interactive=false install

# Initialize the DB
django_db:
	cd $(INCROWD_PATH) && export DJANGO_SETTINGS_MODULE="incrowd.settings" && python manage.py syncdb --noinput --no-initial-data
	cd $(INCROWD_PATH) && export DJANGO_SETTINGS_MODULE="incrowd.settings" && python manage.py migrate --noinput --no-initial-data
	cd $(INCROWD_PATH) && export DJANGO_SETTINGS_MODULE="incrowd.settings" && bash initial_db_load.sh

docker_build:
	docker build -t incrowd .

docker_run:
	docker run -i -v `pwd`:/home/docker/code  -p 8000:8000 -t incrowd /bin/bash

docker_server:
	if [ -e config/newrelic.ini ]; then \
		echo "Running with NewRelic"; \
		cd $(INCROWD_PATH) && DJANGO_SETTINGS_MODULE="incrowd.settings" NEW_RELIC_CONFIG_FILE=config/newrelic.ini newrelic-admin run-program python manage.py runserver 0.0.0.0:8000; \
	else \
		cd $(INCROWD_PATH) && DJANGO_SETTINGS_MODULE="incrowd.settings" python manage.py runserver 0.0.0.0:8000; \
	fi

pep8:
	flake8 api
	flake8 chat_server
	flake8 incrowd
	flake8 fantasy_football
	flake8 invite_only
	flake8 notify
	flake8 poll
	flake8 push
	flake8 website

test_django:
	python manage.py test

# Install tools if you don't wanna use Docker
install_ubuntu:
	sudo apt-get install python-dev git python-pip mysql-server mysql libmysqlclient-dev mysql-python
	sudo pip install tox
	sudo npm install -g grunt-cli bower
	tox -e dev
	DJANGO_SETTINGS_MODULE="incrowd.settings" dev/bin/python manage.py help
	DJANGO_SETTINGS_MODULE="incrowd.settings" dev/bin/python manage.py syncdb --noinput
	DJANGO_SETTINGS_MODULE="incrowd.settings" dev/bin/python manage.py migrate --noinput

install_osx:
	brew install git mysql tox
	sudo easy_install pip
	sudo npm install -g grunt-cli bower
	mysql.server start
	tox -e dev
	DJANGO_SETTINGS_MODULE="incrowd.settings" dev/bin/python manage.py help
	DJANGO_SETTINGS_MODULE="incrowd.settings" dev/bin/python manage.py syncdb --noinput
	DJANGO_SETTINGS_MODULE="incrowd.settings" dev/bin/python manage.py migrate --noinput

# Dump data that can be loaded
dump_data:
	python manage.py dumpdata  --natural \
               --indent=4 \
               -e south \
               -e sessions \
               -e admin \
               -e contenttypes \
               -e auth.Permission > getting_started_data.json

# Load dev data
load_data:
	python manage.py loaddata getting_started_data.json

#########################
# Build/deploy tools
#########################

build_frontend_prod:
	grunt --gruntfile frontend/Gruntfile.js prod

build_frontend:
	grunt --gruntfile frontend/Gruntfile.js

www_prod: build_frontend_prod
	grunt --gruntfile frontend/Gruntfile.js www

www: build_frontend
	grunt --gruntfile frontend/Gruntfile.js www

# Link libs for AppEngine
link_libs:
	mkdir -p libs
	bash install_libs.sh

sync_appengine:
	SETTINGS_MODE=prod source prod_exports && dev/bin/python manage.py syncdb
	SETTINGS_MODE=prod source prod_exports && dev/bin/python manage.py migrate

deploy:
	cd frontend/ && npm install
	cd frontend/ && bower install
	appcfg.py update .

rollback:
	appcfg.py rollback .

clean_www:
	rm -rf www/*

clean_app:
	rm -rf cordova/www/*

clean_build:
	rm -rf frontend/build/*


#########################
# CI/CD tools
#########################

install_ci:
	npm install -g bower grunt grunt-cli


#########################
# Misc
#########################

whoopee:
	echo "Sorry, I'm not in the mood"
