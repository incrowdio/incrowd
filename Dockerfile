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
ENV SETTINGS_MODE prod
# TODO(pcsforeducation) make this dynamic
ENV DOCKER_HOST_IP 172.17.42.1
ENV INCROWD_PATH "/home/docker/code"

WORKDIR /home/docker/code

ADD docker_configs/install.sh /home/docker/code/install.sh
ADD incrowd/requirements.txt /home/docker/code/requirements.txt
RUN bash /home/docker/code/install.sh

# Prepare services
ADD docker_configs/uwsgi.ini /home/docker/code/uwsgi.ini

# Everything after this point won't be cached on builds
ADD incrowd/ /home/docker/code

# Finalize and clean up
EXPOSE 80
VOLUME ["/home/docker/code/config/"]

cmd ["/usr/local/bin/uwsgi", "--ini", "/home/docker/code/uwsgi.ini"]
