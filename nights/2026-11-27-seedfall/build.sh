#!/usr/bin/env bash
# Build Seedfall to a static site in dist/.
# Needs node + tsc (mise.toml pins both; run through `mise exec --`).
set -euo pipefail
cd "$(dirname "$0")"

rm -rf dist
mkdir -p dist/app
tsc -p tsconfig.json
cp index.html styles.css dist/

# Prove every glade starts unsolved and has a route to its hollows.
node tools/validate.mjs
