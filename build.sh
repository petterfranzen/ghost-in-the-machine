#!/usr/bin/env bash
# Build Koi Drift: compile the Gleam pond to JavaScript, wrap it in the static
# site that Pages serves, and check both halves before calling it done.
set -euo pipefail
cd "$(dirname "$0")"

if command -v gleam >/dev/null 2>&1; then
  GLEAM="gleam"
elif command -v mise >/dev/null 2>&1; then
  GLEAM="mise exec -- gleam"
else
  echo "error: gleam not found (install it with 'mise install')" >&2
  exit 1
fi

if command -v node >/dev/null 2>&1; then
  NODE="node"
elif command -v mise >/dev/null 2>&1; then
  NODE="mise exec -- node"
else
  echo "error: node not found (install it with 'mise install')" >&2
  exit 1
fi

echo "== the pond, stepped without a browser"
$GLEAM test --target javascript

echo "== compiling Gleam to JavaScript"
$GLEAM build --target javascript

echo "== dist/"
rm -rf dist
$NODE tools/pack.mjs
cp src/index.html dist/index.html
cp src/app.js dist/app.js

echo "== checks"
test -s dist/index.html
test -s dist/app.js
test -s dist/js/koi_drift/koi_drift.js
grep -q 'id="stage"' dist/index.html
grep -q './app.js' dist/index.html
grep -q 'requestAnimationFrame' dist/app.js
grep -q 'pointerdown' dist/app.js
grep -q 'toArray' dist/js/prelude.js
grep -q 'export function advance' dist/js/koi_drift/koi_drift.js
# app.js is a browser ES module; parse it as one without a browser.
$NODE --check <(cat dist/app.js) 2>/dev/null || { cp dist/app.js /tmp/koi_app_check.mjs; $NODE --check /tmp/koi_app_check.mjs; }
$NODE tools/smoke.mjs
$NODE tools/render-smoke.mjs

echo "built dist/: $(find dist -type f | wc -l | tr -d ' ') files, $(du -sh dist | cut -f1)"
