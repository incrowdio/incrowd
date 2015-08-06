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

FROM debian:latest

MAINTAINER josh@servercobra.com

# Set some settings
ENV DJANGO_SETTINGS_MODULE incrowd.settings
ENV DEBIAN_FRONTEND noninteractive
ENV INITRD No
ENV SETTINGS_MODE prod

ENV INCROWD_PATH "/home/docker/code"

WORKDIR /home/docker/

# System requirements, like Python
ADD incrowd/requirements.txt /home/docker/requirements.txt
ADD incrowd/dev_requirements.txt /home/docker/dev_requirements.txt
ADD docker_configs/install.sh /home/docker/install.sh
ADD docker_configs/install_npm.sh /home/docker/install_npm.sh
RUN bash /home/docker/install.sh

# Add the code
ADD incrowd/ /home/docker/code

# Link frontend dependencies, build frontend
WORKDIR /home/docker/code/frontend

# TODO(pcsforeducation) make another dockefile to run gulp build
# Build frontend dependencies
ADD docker_configs/frontend_build.sh /home/docker/frontend_build.sh
RUN bash /home/docker/frontend_build.sh

# Prepare services
ADD docker_configs/uwsgi.ini /home/docker/code/uwsgi.ini

# Finalize and clean up
EXPOSE 80
VOLUME ["/home/docker/code/config/"]

WORKDIR /home/docker/code
ADD docker_configs/start.sh /home/docker/code/start.sh
cmd ["bash", "/home/docker/code/start.sh"]
