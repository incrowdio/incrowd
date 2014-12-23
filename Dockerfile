# Copyright 2014 Josh Gachnang
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from ubuntu:trusty

maintainer josh@servercobra.com

ENV INCROWD_PATH /home/docker/code
ENV DJANGO_SETTINGS_MODULE cliques.settings
ENV DEBIAN_FRONTEND noninteractive
ENV INITRD No
ENV SETTINGS_MODE prod

RUN apt-get update
RUN apt-get install  -y --no-install-recommends software-properties-common
RUN apt-get update
RUN add-apt-repository  -y  ppa:nginx/stable

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    gcc \
    git \
    libmysqlclient-dev \
    libsqlite3-dev \
    libxml2-dev \
    locales \
    make \
    mysql-client \
    npm \
    nginx \
    python \
    python-dev \
    python-pip \
    sqlite3 \
    supervisor

RUN npm install -g bower grunt-cli

RUN pip install uwsgi

# Need symlink for bower to work with node
RUN ln -s /usr/bin/nodejs /usr/bin/node

# Delay adding the whole root to speed up subsequent builds via caching
ADD cliques/requirements.txt $INCROWD_PATH/requirements.txt

# run pip install
RUN pip install -r $INCROWD_PATH/requirements.txt

# Prepare services
RUN echo "daemon off;" >> /etc/nginx/nginx.conf
RUN rm /etc/nginx/sites-enabled/default
ADD docker_configs/incrowd.nginx /etc/nginx/sites-enabled/incrowd.conf
ADD docker_configs/uwsgi.params /etc/nginx/uwsgi.params
ADD docker_configs/incrowd.supervisor /etc/supervisor/conf.d/incrowd.conf
ADD docker_configs/uwsgi.ini $INCROWD_PATH/uwsgi.ini

ADD cliques/ $INCROWD_PATH

WORKDIR $INCROWD_PATH

# Prepare Django
RUN python manage.py collectstatic --noinput --link

# install frontend dependencies
WORKDIR $INCROWD_PATH/frontend

RUN npm install

RUN bower --allow-root --config.interactive=false install

WORKDIR $INCROWD_PATH

RUN grunt --gruntfile frontend/Gruntfile.js prod

# clean packages
RUN apt-get clean
RUN rm -rf /var/cache/apt/archives/* /var/lib/apt/lists/*

# Finalize
EXPOSE 80

WORKDIR $INCROWD_PATH

cmd ["supervisord", "-n"]

