#!/usr/bin/env bash
# Build Snow Garden -> a static site in dist/.
#
#   rustc            # the simulation, straight to WebAssembly (no cargo)
#   tools/smoke.cjs  # the same module, driven in plain Node
#   tools/embed.mjs  # fold the wasm and the host into dist/app.js
set -euo pipefail
cd "$(dirname "$0")"

echo "== toolchain =="
rustc --version
if ! rustup target list --installed 2>/dev/null | grep -q '^wasm32-unknown-unknown$'; then
  echo "adding the wasm32 target"
  rustup target add wasm32-unknown-unknown
fi

echo "== compile (Rust -> WebAssembly) =="
mkdir -p build dist
rustc --edition 2021 \
  --target wasm32-unknown-unknown \
  --crate-type cdylib \
  -C panic=abort -C opt-level=3 -C lto -C strip=debuginfo \
  -o build/snow_garden.wasm src/lib.rs

echo "== smoke (the simulation in plain Node) =="
node tools/smoke.cjs build/snow_garden.wasm

echo "== bundle =="
node tools/embed.mjs

test -s dist/index.html
echo "ok: $(du -h build/snow_garden.wasm | cut -f1) wasm + dist/index.html"
