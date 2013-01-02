#!/bin/bash

set -e

cd "$(git rev-parse --show-toplevel)"

DESTINATION=bolinfest.com:/www/bolinfest.com/typescript

# Build and upload the new version of typescript.js.
make compiler
scp built/local/typescript.js $DESTINATION

# Include the contents of lib.d.ts as a JavaScript string.
EXTERNS_FILE=closure/demo/externs.js
perl -p -e 's/[\n\r]+/\\n/' built/local/lib.d.ts > $EXTERNS_FILE
sed -i -e "s#\(.*\)#var EXTERNS = '\1';#" $EXTERNS_FILE
scp $EXTERNS_FILE $DESTINATION/externs.js
rm $EXTERNS_FILE

# Modify index.html to contain the production path to typescript.js.
INDEX=closure/demo/prod-index.html
cp closure/demo/index.html $INDEX
sed -i -e 's#../../built/local/typescript.js#typescript.js#' $INDEX
scp $INDEX $DESTINATION/index.html
rm $INDEX

scp closure/demo/demo.js $DESTINATION
