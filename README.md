cliques
=======

A private social network focused on small (under 25 people) groups.

Local dev environment
--------------------

Local development is done with Docker. The included Dockerfile will build a 
development environment and configure it correctly, mounting this directory
in so your changes are automatically reflected.

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

You can load some dev data to get you started by running `make load_dev_data` 
after you've run docker_dev once. 

The default user name and password is "admin" and "pass".

You can access the admin interface at http://$DOCKER_IP:8000/admin/.

Contributing
------------
We follow the standard branch and PR or fork and PR model. Travis will test your code when you submit it, and CodeShip will test and deploy your code when it is merged to the master branch.

Append "--skip-ci" to the bottom of commits in PRs to avoid having CodeShip build them (we only get 50 free builds a month, unlimited is $50/mo). Travis will still build and test your commits.

[![Build Status](https://travis-ci.org/pcsforeducation/cliques.svg?branch=master)](https://travis-ci.org/pcsforeducation/cliques)

[ ![Codeship Status for pcsforeducation/cliques](https://codeship.io/projects/0fb2e970-0825-0132-8774-7a8fe1d63f6e/status)](https://codeship.io/projects/31328)
