#!/usr/bin/env bash
# Build Night Pond: compile the ReScript simulation, then assemble dist/ from
# src/ (index.html, view.js, host.js) plus the compiled module.
set -euo pipefail
cd "$(dirname "$0")"

RESCRIPT="npx --no-install rescript"
if ! command -v node >/dev/null 2>&1; then
  if command -v mise >/dev/null 2>&1; then
    export PATH="$(mise exec -- node -e 'console.log(process.execPath)' | xargs dirname):$PATH"
  else
    echo "error: node not found (run 'mise install')" >&2; exit 1
  fi
fi

if [ ! -x node_modules/.bin/rescript ]; then
  echo "== installing the pinned ReScript compiler"
  npm install --no-audit --no-fund --loglevel=error
fi

echo "== compiling the pond"
$RESCRIPT build

echo "== stepping the pond without a browser"
node test/sim.test.mjs

echo "== dist/"
rm -rf dist && mkdir -p dist
cp src/index.html dist/index.html
# one self-contained script, so the page also works opened straight from disk
node_modules/.bin/esbuild src/host.js \
  --bundle --format=iife --target=es2020 --legal-comments=none \
  --outfile=dist/app.js

echo "== checks"
test -s dist/index.html
test -s dist/app.js
grep -q 'id="stage"' dist/index.html
grep -q './app.js' dist/index.html
grep -q 'requestAnimationFrame' dist/app.js
grep -q 'NightPond' dist/app.js
node --check dist/app.js

echo "built dist/: $(find dist -type f | wc -l | tr -d ' ') files, $(du -sh dist | cut -f1)"
