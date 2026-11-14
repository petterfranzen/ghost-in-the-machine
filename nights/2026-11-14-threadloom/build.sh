#!/usr/bin/env bash
# Builds the static site into dist/. Requirements: node (see mise.toml) and npm.
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -d node_modules ]; then
  if [ -f package-lock.json ]; then
    npm ci --no-audit --no-fund
  else
    npm install --no-audit --no-fund
  fi
fi

node test/art-check.mjs
npx rescript build

rm -rf dist
mkdir -p dist
npx esbuild lib/es6/src/Main.res.js --bundle --minify --format=esm --outfile=dist/app.js
cp index.html dist/index.html
echo "built dist/index.html + dist/app.js"
