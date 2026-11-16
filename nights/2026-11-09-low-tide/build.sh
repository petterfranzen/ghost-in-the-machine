#!/usr/bin/env bash
# Low Tide — build the static site into dist/ (Pages publishes dist/ as it is).
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -d node_modules ]; then
  npm ci --no-audit --no-fund
fi

npx --no-install spago build

mkdir -p dist
npx --no-install esbuild src/host.js --bundle --format=iife --minify --outfile=dist/app.js
cp src/index.html dist/index.html
cp src/style.css dist/style.css
