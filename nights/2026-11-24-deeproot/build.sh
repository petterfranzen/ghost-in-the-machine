#!/usr/bin/env bash
# Build Deeproot to a static site in dist/.
# Requires node + tsc (mise.toml pins both; run through `mise exec --`).
set -euo pipefail
cd "$(dirname "$0")"

rm -rf dist
mkdir -p dist/app
tsc -p tsconfig.json
cp index.html styles.css dist/

# Prove every level is solvable (and none is already solved) before shipping.
node tools/validate.mjs
