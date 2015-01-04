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

ENV DJANGO_SETTINGS_MODULE incrowd.settings
ENV DEBIAN_FRONTEND noninteractive
ENV INITRD No
ENV SETTINGS_MODE testing
# TODO(pcsforeducation) make this dynamic
ENV DOCKER_HOST_IP 172.17.42.1

RUN apt-get update && \
    apt-get install -y --no-install-recommends software-properties-common && \
    add-apt-repository -y ppa:nginx/stable && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        curl \
        git-core \
        libmysqlclient-dev \
        libsqlite3-dev \
        libxml2-dev \
        make \
        npm \
        nginx-full \
        python \
        python-dev \
        python-pip \
        sqlite3 \
        supervisor

RUN npm install -g bower grunt-cli

RUN pip install uwsgi

# Need symlink for bower to work with node
RUN ln -s /usr/bin/nodejs /usr/bin/node

# install our code
ADD dev_requirements.txt /home/docker/code/dev_requirements.txt
ADD requirements.txt /home/docker/code/requirements.txt

# run pip install
RUN pip install -r /home/docker/code/dev_requirements.txt

EXPOSE 8000

ENV INCROWD_PATH "/home/docker/code"

VOLUME /home/docker/code
WORKDIR /home/docker/code
