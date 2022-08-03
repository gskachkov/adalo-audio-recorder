#!/bin/bash
set -e
set -x

rm ./src/components/params/index.js
cp ./src/components/params/index.full.js ./src/components/params/index.js

rm ./package.json
cp ./package-full.json ./package.json

npm run publish