#!/bin/bash
set -e

# Only deploy if this is is not a pull request (i.e., this comes from a trusted source)
if [ "${TRAVIS_PULL_REQUEST}" = "false" ]; then
  eval "$(ssh-agent -s)" 
  echo -e $RESIN_DEPLOY_KEY > id_rsa
  chmod 0600 id_rsa
  ssh-add ./id_rsa
  cat resinkey >> ~/.ssh/known_hosts
  git remote add resin $RESIN_REMOTE
  git push resin master
fi

