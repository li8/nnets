#!/bin/bash -ex


# install sqlite3
sudo apt-get update
sudo apt-get install sqlite3 libsqlite3-dev

# install nvm
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash


export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" # This loads nvm

nvm install 9
nvm use 9
npm install
