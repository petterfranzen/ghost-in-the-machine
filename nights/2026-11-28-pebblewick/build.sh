#!/usr/bin/env bash
# Builds Pebblewick into dist/ and rolls every shelf once, headless.
# The build needs no network: TypeScript comes from mise, matter.js is vendored.
set -euo pipefail
cd "$(dirname "$0")"

run() {
  if command -v mise >/dev/null 2>&1; then mise exec -- "$@"; else "$@"; fi
}

rm -rf dist
mkdir -p dist

run tsc -p tsconfig.json
cp index.html styles.css dist/
cp vendor/matter.min.js dist/

# Smoke check: six shelves, each rollable, none solved at the start.
run node tools/validate.mjs

echo "pebblewick: dist/ ready ($(find dist -type f | wc -l | tr -d ' ') files)"
