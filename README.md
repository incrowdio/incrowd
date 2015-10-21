
inCrowd 
=======

A private, invite-only social network focused on small groups.

![CI Status](https://circleci.com/gh/circleci/mongofinil.svg?&style=shield&circle-token=b14acf911433d315298235b0c2fbf7b2670a92a8)

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


Development
--------------------

inCrowd is deployed and developed using Docker containers. You'll first need to
[install Docker](https://docs.docker.com/installation/).

The Dockerfile will build a container to run inCrowd, but can also be used for
all your development needs, by ounting the `incrowd/` directory into the
container.

To build a container, mount `incrowd/` and bootstrap the backend server:

    make dev

After a few minutes, it will be running Django's development server. You can
get to the API by browsing [http://localhost:8000/api/v1/](http://localhost:8000/api/v1/),
and the admin interface by going to
[http://localhost:8000/admin/](http://localhost:8000/admin/).

The frontend can easily be run outside the container. To bootstrap all the
required dependencies:

    make frontend_install

Then, you can run the automatically reloading frontend server:

    make serve

This should open a browser window to
[http://localhost:3000](http://localhost:3000). Each time you change one
of the frontend files, gulp will notice the change, recompile the frontend, and
refresh your browser.

PRs will be automatically tested with both the unit tests and an integration tests
by a TeamCity server. The frontened will be tested by 
[BrowserStack](https://www.browserstack.com/), who has graciously donated free
testing for inCrowd (thanks!!).

Protip for OSX:
---------------
You can portfoward the backend boot2docker server so you can access it from the
network, e.g. from a phone you're testing the app on. Run this command while
boot2docker is shutdown:
    
    VBoxManage modifyvm "boot2docker-vm" --natpf1 "tcp-port8000,tcp,,8000,,8000";

Contributing
------------
We follow the standard fork and PR model. Teamcity will test your code when you
submit it, and deploy to our testing environment when PRs are merged. Merges
will also upload a new version of the incrowd/incrowd:testing container to
the Docker Hub.
