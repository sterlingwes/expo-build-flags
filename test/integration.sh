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
cp ../test/integration/default-flags.yml ./flags.yml

echo "run CLI flag override"
./node_modules/.bin/build-flags override +secretFeature -newFeature

written=$(cat constants/buildFlags.ts)
expected=$(cat ../test/integration/expected-cli-override.ts)

if [[ "$written" ==  "$expected" ]]; then
  echo "CLI flag override passed"
else
  echo "CLI flag override failed"
  diff <(echo "$written") <(echo "$expected")
  exit 1
fi

# test programmatic api
echo "run programmatic flag override"
cp ../test/integration/api-usage.mjs ./
node api-usage.mjs

written=$(cat constants/buildFlags.ts)
expected=$(cat ../test/integration/expected-api-override.ts)

if [[ "$written" ==  "$expected" ]]; then
  echo "API flag override passed"
else
  echo "API flag override failed"
  diff <(echo "$written") <(echo "$expected")
  exit 1
fi
