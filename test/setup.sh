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
