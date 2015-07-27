#!/bin/bash
set -e

echo "deb http://ftp.us.debian.org/debian wheezy-backports main" >> /etc/apt/sources.list
apt-get update
apt-get install -y --no-install-recommends software-properties-common \
    build-essential \
    curl \
    git-core \
    libmysqlclient-dev \
    libsqlite3-dev \
    libxml2-dev \
    make \
    nano \
    nodejs-legacy \
    python \
    python-dev \
    python-pip \
    supervisor

easy_install -U pip

pip install -r requirements.txt
pip install -r dev_requirements.txt

bash install_npm.sh

npm install bower -g

apt-get purge -y \
    man \
    vim-common \
    vim-tiny \
    libpython3.4-stdlib:amd64 \
    python3.4-minimal \
    eject \
    locales \
    software-properties-common \
    python3
apt-get -y clean
apt-get -y autoclean
apt-get -y autoremove
rm -rf /var/cache/apt/archives/* /var/lib/apt/lists/* /tmp/* /var/tmp/*
