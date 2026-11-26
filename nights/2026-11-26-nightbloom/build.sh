#!/usr/bin/env bash
# Build Nightbloom to a static site in dist/.
# Needs node + tsc (mise.toml pins both; run through `mise exec --`).
set -euo pipefail
cd "$(dirname "$0")"

rm -rf dist
mkdir -p dist/app
tsc -p tsconfig.json
cp index.html styles.css dist/

# Prove every meadow starts unsolved and the recorded solution opens it.
node tools/validate.mjs
