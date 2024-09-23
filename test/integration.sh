#!/bin/bash

set -e

npm run build

echo "Creating expo app"
rm -rf example
CI=1 npx create-expo-app example

echo "Installing library"
cd example
npm install --save-dev typescript@5
npm install --save-dev ../
# ensure we don't carry over any dependencies via local install
rm -rf node_modules/expo-build-flags/node_modules

echo "copy over flag fixture"
cp ../test/integration/default-flags.json ./flags.json

echo "run CLI flag override"
npx build-flags override +secretFeature -newFeature

written=$(cat app/buildFlags.ts)
expected=$(cat ../test/integration/expected-merge.ts)

if [[ "$written" ==  "$expected" ]]; then
  echo "CLI flag override passed"
else
  echo "CLI flag override failed"
  exit 1
fi
