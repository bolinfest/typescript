#!/bin/bash

set -e

cd "$(git rev-parse --show-toplevel)"

DESTINATION=bolinfest.com:/www/bolinfest.com/typescript

# Build and upload the new version of typescript.js.
make compiler
scp built/local/typescript.js $DESTINATION

# Modify index.html to contain the production path to typescript.js.
INDEX=closure/demo/prod-index.html
cp closure/demo/index.html $INDEX
sed -i -e 's#../../built/local/typescript.js#typescript.js#' $INDEX
scp $INDEX $DESTINATION/index.html
rm $INDEX

scp closure/demo/demo.js $DESTINATION
