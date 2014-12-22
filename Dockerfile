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

from debian:jessie

maintainer josh@servercobra.com

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    git \
    libmysqlclient-dev \
    libsqlite3-dev \
    libxml2-dev \
    locales \
    make \
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

RUN dpkg-reconfigure locales && \
    locale-gen C.UTF-8 && \
    /usr/sbin/update-locale LANG=C.UTF-8

ENV LC_ALL C.UTF-8

ENV INCROWD_PATH /home/docker/code
ENV DJANGO_SETTINGS_MODULE cliques.settings

ADD ../ $INCROWD_PATH

# run pip install
RUN pip install -r $INCROWD_PATH/requirements.txt

# install frontend dependencies
WORKDIR $INCROWD_PATH/frontend

RUN npm install

RUN bower --allow-root --config.interactive=false install

WORKDIR $INCROWD_PATH

grunt --gruntfile frontend/Gruntfile.js prod

# Prepare Django
python manage.py collectstatic

# Finalize
EXPOSE 80

WORKDIR $INCROWD_PATH
