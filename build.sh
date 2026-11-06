#!/usr/bin/env bash
# Build Lantern Moss: compile the Zig clearing to WebAssembly, embed it in a
# plain script so the page also runs from file://, and assemble dist/.
set -euo pipefail
cd "$(dirname "$0")"

ZIG=zig
NODE=node
if ! command -v zig >/dev/null 2>&1; then
  if command -v mise >/dev/null 2>&1; then ZIG="mise exec -- zig"; else
    echo "error: zig not found (run 'mise install')" >&2; exit 1; fi
fi
if ! command -v node >/dev/null 2>&1; then
  if command -v mise >/dev/null 2>&1; then NODE="mise exec -- node"; else
    echo "error: node not found (run 'mise install')" >&2; exit 1; fi
fi

mkdir -p .build
echo "== the clearing, stepped without a browser"
$ZIG test src/world_test.zig

echo "== compiling to wasm32-freestanding"
$ZIG build-exe src/main.zig \
  -target wasm32-freestanding -fno-entry \
  --export=init --export=step --export=tap --export=state_ptr --export-memory \
  -O ReleaseSmall -femit-bin=.build/game.wasm

echo "== dist/"
rm -rf dist && mkdir -p dist
$NODE tools/embed.mjs .build/game.wasm dist/wasm.js
cp src/index.html dist/index.html
cp src/app.js dist/app.js

echo "== checks"
test -s dist/index.html
test -s dist/app.js
test -s dist/wasm.js
test -s .build/game.wasm
grep -q 'id="stage"' dist/index.html
grep -q './app.js' dist/index.html
grep -q './wasm.js' dist/index.html
grep -q 'pointerdown' dist/app.js
grep -q 'requestAnimationFrame' dist/app.js
grep -q 'WASM_B64' dist/wasm.js
$NODE --check dist/app.js
$NODE tools/smoke.mjs .build/game.wasm

echo "built dist/: $(find dist -type f | wc -l | tr -d ' ') files, $(du -sh dist | cut -f1)"
