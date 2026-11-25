#!/usr/bin/env bash
# Builds the static site in dist/: one Ruby bundle, the WebAssembly Ruby and the page.
set -euo pipefail
cd "$(dirname "$0")"

ORDER=(palette rules levels game render scene audio input hud main)
rm -rf dist
mkdir -p dist

{
  echo "# Summerkeep — built from src/ by build.sh. The solver (src/solver.rb) stays on the build machine."
  for name in "${ORDER[@]}"; do
    echo "# --- src/${name}.rb"
    cat "src/${name}.rb"
  done
} > dist/app.rb

cp wasm/ruby.wasm.gz dist/ruby.wasm.gz
cp vendor/ruby-wasm-wasi/browser.umd.js dist/ruby-wasm-wasi.umd.js
cp web/index.html dist/index.html

echo "dist/:"
ls -la dist | tail -n +2 | awk '{print "  " $9 " " $5}'
