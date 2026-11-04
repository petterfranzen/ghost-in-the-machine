#!/usr/bin/env bash
# Build Pebble Pond: unit-test the pond's rules, compile the module to
# WebAssembly, embed it in a plain script so the page also runs from file://,
# and assemble the committed dist/.
set -euo pipefail
cd "$(dirname "$0")"

TARGET=wasm32-unknown-unknown
RUN=()
if ! command -v rustc >/dev/null 2>&1; then
  if command -v mise >/dev/null 2>&1; then RUN=(mise exec --); else
    echo "error: rustc not found (run 'mise install')" >&2; exit 1; fi
fi
NODE=node
command -v node >/dev/null 2>&1 || NODE="mise exec -- node"

mkdir -p .build

echo "== the pond's rules, stepped natively"
"${RUN[@]}" rustc --edition 2021 --test src/lib.rs -o .build/tests
./.build/tests

echo "== ensuring the $TARGET target is installed"
if "${RUN[@]}" rustup --version >/dev/null 2>&1; then
  if ! "${RUN[@]}" rustup target list --installed 2>/dev/null | grep -qx "$TARGET"; then
    "${RUN[@]}" rustup target add "$TARGET"
  fi
else
  echo "  (no rustup; assuming the $TARGET target is already available)" >&2
fi

echo "== compiling to $TARGET"
"${RUN[@]}" rustc --edition 2021 --target "$TARGET" --crate-type cdylib \
  -C panic=abort -C opt-level=3 -C lto -C codegen-units=1 -C strip=debuginfo \
  src/lib.rs -o .build/pond.wasm

echo "== dist/"
rm -rf dist && mkdir -p dist
$NODE tools/embed.mjs .build/pond.wasm dist/pond.wasm.js
cp src/index.html dist/index.html
cp src/app.js dist/app.js

echo "== checks"
test -s dist/index.html
test -s dist/app.js
test -s dist/pond.wasm.js
test -s .build/pond.wasm
grep -q 'id="stage"' dist/index.html
grep -q './app.js' dist/index.html
grep -q './pond.wasm.js' dist/index.html
grep -q 'pointerdown' dist/app.js
grep -q 'requestAnimationFrame' dist/app.js
grep -q 'WASM_B64' dist/pond.wasm.js
$NODE --check dist/app.js
$NODE tools/smoke.mjs .build/pond.wasm

echo "built dist/: $(find dist -type f | wc -l | tr -d ' ') files, $(du -sh dist | cut -f1)"
