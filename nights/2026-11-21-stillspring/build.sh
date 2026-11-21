#!/usr/bin/env bash
# Builds the static site into dist/ : the Lua game, the host, and the page.
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -d node_modules ]; then
  npm install --no-audit --no-fund
fi

rm -rf dist
mkdir -p dist

npx esbuild src/main.js \
  --bundle --format=iife --minify --sourcemap \
  --loader:.lua=text \
  --outfile=dist/app.js --log-level=error

cp src/index.html dist/index.html
cp src/style.css dist/style.css
echo "built dist/ ($(du -sh dist | cut -f1))"
