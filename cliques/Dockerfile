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
    python \
    python-dev \
    python-pip

RUN npm install -g bower grunt-cli

# Need symlink for bower to work with node
ln -s /usr/bin/nodejs /usr/bin/node

RUN dpkg-reconfigure locales && \
    locale-gen C.UTF-8 && \
    /usr/sbin/update-locale LANG=C.UTF-8

ENV LC_ALL C.UTF-8

ENV INCROWD_PATH /home/docker/code

# install our code
ADD requirements.txt $INCROWD_PATH/requirements.txt

# run pip install
RUN pip install -r $INCROWD_PATH/requirements.txt

EXPOSE 8000

VOLUME $INCROWD_PATH
WORKDIR $INCROWD_PATH
