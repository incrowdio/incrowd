all: clean test www

prod: clean test www_prod link_libs

upload: docker_upload

docker: docker_build docker_run

dev: docker_build run_dev

clean: clean_www clean_app clean_build

test: pep8 test_django

ci: docker_build_ci docker_run_tests integration

promote: docker_promote

#########################
# Dev tools
#########################


docker_build:
	cd incrowd && docker build -t incrowd .

docker_upload:
	docker build -t incrowd/incrowd:testing .
	docker push incrowd/incrowd:testing

docker_promote:
	docker build incrowd/incrowd
	docker push incrowd/incrowd    

docker_run:
	docker run -i -v `pwd`/incrowd:/home/docker/code -p 8000:8000 -t incrowd /bin/bash -c "make docker_dev"

run_dev:
	docker run -i -v `pwd`/incrowd:/home/docker/code -p 8000:8000 -t incrowd /bin/bash -c "make docker_server"

docker_shell:
	docker run -i -v `pwd`/incrowd:/home/docker/code -t incrowd /bin/bash

docker_build_ci:
	docker build -t incrowd/incrowd:testing .

docker_run_tests:
	docker run -e DB_ADDR=$(DB_ADDR) -t incrowd/incrowd:testing /bin/bash -c "make test"

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

test_django:
	cd incrowd && python manage.py test --noinput

integration:
	./tests/integration.sh

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



#########################
# CI/CD tools
#########################

install_ci:
	npm install -g bower grunt grunt-cli

build_testing:
	docker build -t incrowd/incrowd:testing .

push_testing:
	docker push incrowd/incrowd:testing

build_prod:
	docker build -t incrowd/incrowd .

push_prod:
	docker push incrowd/incrowd

#########################
# Misc
#########################

whoopee:
	echo "Sorry, I'm not in the mood"

