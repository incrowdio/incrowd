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
# TODO(pcsforeducation) make this dynamic
ENV DOCKER_HOST_IP 172.17.42.1
ENV INCROWD_PATH "/home/docker/code"

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
            nano \
            npm \
            nginx-full \
            python \
            python-dev \
            python-pip \
            python-setuptools \
            sqlite3 \
            supervisor && \
        easy_install -U pip && \
        pip install uwsgi && \
        apt-get -y clean && \
        apt-get -y autoclean && \
        apt-get -y autoremove && \
        rm -rf /var/cache/apt/archives/* /var/lib/apt/lists/*

# Need symlink for bower to work with node
RUN npm install -g bower gulp && ln -s /usr/bin/nodejs /usr/bin/node

# Install node modules
ADD frontend/package.json /home/docker/package.json

# Install python modules
ADD dev_requirements.txt /home/docker/dev_requirements.txt
ADD requirements.txt /home/docker/requirements.txt

# run pip install
RUN pip install -r /home/docker/requirements.txt
RUN pip install -r /home/docker/dev_requirements.txt

# Clean up packages required for build
RUN apt-get purge -y \
    vim-common \
    vim-tiny \
    libpython3.4-stdlib:amd64 \
    python3.4-minimal \
    eject \
    locales \
    software-properties-common \
    python3

ENV SETTINGS_MODE "testing"
EXPOSE 8000

VOLUME /home/docker/code
WORKDIR /home/docker/code
