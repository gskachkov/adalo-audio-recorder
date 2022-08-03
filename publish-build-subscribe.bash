#!/bin/bash
set -e
set -x

rm ./src/components/params/index.js
cp ./src/components/params/index.subscription.js ./src/components/params/index.js 

rm ./package.json
cp ./package-subscription.json ./package.json

npm run publish