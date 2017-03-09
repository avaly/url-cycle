#!/usr/bin/env bash

set -euo pipefail

function cleanup {
	rm -f .git/credentials
}
trap cleanup EXIT

PAGES_REPO="tmp"
mkdir $PAGES_REPO

git clone -v https://github.com/avaly/url-cycle.git $PAGES_REPO
cd $PAGES_REPO

git config credential.helper "store --file=.git/credentials"
echo "https://$GH_TOKEN:@github.com" > .git/credentials
git config user.name "Travis-CI"
git config user.email "travis@travis-ci.com"

git checkout gh-pages
git merge --ff-only master
git --no-pager log -n 3
git push -f origin gh-pages
