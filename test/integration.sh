#!/bin/bash

set -e

npm run build

echo "Creating expo app"
rm -rf example
CI=1 npx create-expo-app example

echo "Installing library"
cd example
npm install --install-links --save-dev ../

echo "copy over flag fixture"
cp ../test/integration/default-flags.json ./flags.json

echo "run CLI flag override"
./node_modules/.bin/build-flags override +secretFeature -newFeature

written=$(cat app/buildFlags.ts)
expected=$(cat ../test/integration/expected-merge.ts)

if [[ "$written" ==  "$expected" ]]; then
  echo "CLI flag override passed"
else
  echo "CLI flag override failed"
  exit 1
fi
