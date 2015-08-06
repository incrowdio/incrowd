#!/bin/bash
npm install --global gulp
npm install
bower install --allow-root
gulp build
rm -rf /home/docker/code/frontend/src/lib
rm -rf /home/docker/code/frontend/node_modules
