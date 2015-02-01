inCrowd
=======

A private, invite-only social network focused on small groups.

[![Build Status](https://travis-ci.org/pcsforeducation/cliques.svg?branch=master)](https://travis-ci.org/pcsforeducation/cliques)
![Docker Status](http://dockeri.co/image/incrowd/incrowd)

Deploying
---------

inCrowd is deployed as a Docker container. This makes it easy to deploy,
install, and update. 


### Getting a server

To install inCrowd, you'll need a server to run it on. inCrowd is tested on 
Ubuntu 14.04. Debian should work fine as well. You'll also need to install 
Docker or get an server image with Docker preinstalled. Docker 
runs the inCrowd container, which has most of the software and configuration
required to get started. 

For servers, I'd recommend any of:

* [DigitalOcean](https://www.digitalocean.com/?refcode=d9f2ebea8b83) ($10 free, 
  Ubuntu image with Docker pre-installed) 

* [Rackspace](https://developer.rackspace.com/signup/) ($50/mo free for 1 
  year, good support)

* [Amazon AWS](http://aws.amazon.com/free/). (Free micro instance for 1 year)

If you're only running this server, all the services should be somewhat
equivalent. Simply start a server with an Ubuntu 14.04 image (with Docker
pre-installed if possible)

Note: If you use the DigitalOcean link and spend at least $25 on your account,
we get $25 in DigitalOcean credit to use for our build/testing/continuous
integration system and test instances.


### Install Docker

If you didn't use an image with Docker pre-installed, please run these commands
from the command line (taken from the [Docker documentation](https://docs.docker.com/installation/ubuntulinux/)

        curl -sSL https://get.docker.com/ubuntu/ | sudo sh


### Setup MySQL

inCrowd uses MySQL as the database to store users, posts, etc. It is generally
easier to not put MySQL into its own Docker container, so we'll install that
first.

        sudo apt-get -y update
        
        # Choose a secure password when prompted
        sudo apt-get -y install mysql-server mysql-client
          
        sudo nano /etc/mysql/my.cnf
        
        # Replace "bind-address = 127.0.0.1" with 
        
        # "bind-address = 0.0.0.0" or "bind-address = 172.17.42.1", the docker bridge address

        # Restart MySQL for settings to take effect
        sudo /etc/init.d/mysql restart

        mysql -uroot -pYOUR_MYSQL_PASSWORD
        
        > CREATE DATABASE incrowd;

        > GRANT ALL PRIVILEGES ON incrowd.* TO 'incrowd'@'%' IDENTIFIED BY 'incrowd';
        
### Install and run inCrowd

inCrowd is distributed as a Docker container with the inCrowd app and the
Nginx web server. To make management easier, we 
created an init script, which allows you to start, stop, update, and manage 
the DB. It will also ensure that the container starts automatically if your
server is rebooted. 

You can find the script at [https://github.com/incrowdio/incrowd/blob/master/etc/incrowd.init](https://github.com/incrowdio/incrowd/blob/master/etc/incrowd.init)

Download and install the script:

        wget https://raw.githubusercontent.com/incrowdio/incrowd/master/etc/incrowd.init
        
        sudo mv incrowd.init /etc/init.d/incrowd
         
        sudo chmod +x /etc/init.d/incrowd
        
        sudo /etc/init.d/incrowd start

The start command will default to pulling the inCrowd container, running the
database init and migration scripts (including adding default data). The first
time you run it, it may take a few minutes.

You can now visit your site by typing the IP of your server into your browser. 
The default username is "admin" and the password is "pass". You can point any 
domain name at the server, and it will serve inCrowd. The Nginx web server in 
the container will match all domain names by default. 

### Commands

You can run other commands using the init script, by calling 
`/etc/init.d/incrowd $COMMAND`. Some commands you can run:

* stop: Stop the container

* restart: Stop, then start the container

* sync: Runs Django's syncdb and migrate commands. If the DB is empty, installs
        default user, welcome post, etc.
        
* upgrade: Get the latest container

You can modify the init settings by creating a file at /etc/default/incrowd.
The syntax is "$VARIABLE_NAME=$SETTING", one per line, e.g. 
"CONTAINER_NAME=not_incrowd". The settings you can modify are (with defaults in 
brackets):

* CONTAINER_NAME [incrowd]: The name of the running container, passed as 
  --name on docker commands.
  
* CONTAINER_REPO [incrowd/incrowd]: The repo to pull the inCrowd container from

* PULL_ON_STARTUP [true]: Whether docker pull happens on every call to start 
  the container via the init script. If you set this to false, you'll need to 
  run `/etc/init.d/incrowd upgrade` to get updates.

* DB_SYNC_ON_STARTUP [true]:  Whether Django `syncdb` and `migrate` happens on 
  every call to start the container via the init script. If you set this to 
  false, you'll need to  run `/etc/init.d/incrowd sync` after any `upgrade`
  but before `start` to ensure the DB layout is correct for the container.

Development
--------------------

Local development is done with Docker. The incrowd/Dockerfile will build a 
development environment and configure it correctly, mounting this directory
in so your changes are automatically reflected. The root level Dockerfile is
used for the deployable container.

If you are developing using OSX or Windows, you'll need [boot2docker](http://boot2docker.io/) 
or a Linux VM with docker installed.

If you are using Linux, you'll want the latest Docker installed. Use the 
following steps to get a later version than what you can get with package 
managers such as apt-get by default (from the Docker docs):

        sudo sh -c "echo deb https://get.docker.com/ubuntu docker main > /etc/apt/sources.list.d/docker.list"
        
        sudo apt-get update
        
        sudo apt-get install lxc-docker

Once you have Docker, you can build and run the docker container (you can
leave off the 'sudo' if you add your user to the docker group):

        sudo make docker

This will build a Docker container, mount this directory, and then run it. You
will be inside the Docker container when the command finishes. 

Once inside the container, you can run `make docker_dev` to configure the development
environment (install bower and node requirements for the frontend and configure
the database for the backend). You should then be able to access the server
at http://$DOCKER_IP:8000. $DOCKER_IP will depend on whether you're using
Linux, OSX, or Windows.

After the initial config, you can use `make docker_sever` to do a Django
runserver.

You can load some dev data to get you started by running `make load_data` 
after you've run docker_dev once. 

The default user name and password is "admin" and "pass".

You can access the admin interface at http://$DOCKER_IP:8000/admin/.

Contributing
------------
We follow the standard branch and PR or fork and PR model. Travis will test your code when you submit it, and CodeShip will test and deploy your code when it is merged to the master branch.

Append "--skip-ci" to the bottom of commits in PRs to avoid having CodeShip build them (we only get 50 free builds a month, unlimited is $50/mo). Travis will still build and test your commits.
