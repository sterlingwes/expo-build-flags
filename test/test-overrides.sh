#!/bin/bash

set -e

#
# assert initial override of default-flags worked
#

echo "run CLI flag override"
./node_modules/.bin/build-flags override +secretFeature -newFeature


written=$(cat constants/buildFlags.ts)
expected=$(cat ../test/overrides/expected-cli-override.ts)

if [[ "$written" ==  "$expected" ]]; then
  echo "CLI flag override passed"
else
  echo "CLI flag override failed"
  diff <(echo "$written") <(echo "$expected")
  exit 1
fi

#
# assert override can be done programmatically
#

echo "run programmatic flag override"
cp ../test/overrides/api-usage.mjs ./
node api-usage.mjs


written=$(cat constants/buildFlags.ts)
expected=$(cat ../test/overrides/expected-api-override.ts)

if [[ "$written" ==  "$expected" ]]; then
  echo "API flag override passed"
else
  echo "API flag override failed"
  diff <(echo "$written") <(echo "$expected")
  exit 1
fi
