#!/bin/bash

set -e

echo "Creating expo app"
CI=1 yarn create expo-app example --template blank

echo "Installing library"
cd example
yarn add -D ../
# ensure we don't carry over any dependencies via local install
rm -rf node_modules/expo-build-flags/node_modules

echo "copy over flag fixture"
cp ../test/integration/default-flags.json ./flags.json

echo "run CLI flag override"
yarn build-flags override +secretFeature -newFeature

written=$(cat app/buildFlags.json)
expected=$(cat ../test/integration/expected-merge.json)

if [[ "$written" ==  "$expected" ]]; then
  echo "CLI flag override passed"
else
  echo "CLI flag override failed"
  exit 1
fi
