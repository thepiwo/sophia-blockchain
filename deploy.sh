#!/usr/bin/env bash

GIT_REV="$(git rev-parse HEAD)"&& \
rm -rf dist && \
rm -rf node_modules && \
npm install && \
npm run build && \
mkdir deploytemp && \
cd deploytemp/ && \
git init && \
git remote add origin git@github.com:thepiwo/sophia-blockchain.git && \
git fetch && \
git checkout gh-pages && \
git rm -rf . && \
git clean -ffxd && \
cp -r ../dist/* . && \
echo "stupidchain.aeternity.art" > CNAME && \
git add * && \
git commit -m "sophia-blockchain ${GIT_REV} deployment to gh-pages" && \
git fetch && git rebase -s recursive -Xtheirs origin/gh-pages && \
git push origin gh-pages && \
cd .. && \
rm -rf deploytemp
