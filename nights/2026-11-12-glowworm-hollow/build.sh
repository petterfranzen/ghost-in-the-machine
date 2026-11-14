#!/usr/bin/env bash
# Glowworm Hollow -> a static site in dist/.
#
#   C, freestanding wasm32   src/sim.c  -> build/sim.wasm   (clang from wasi-sdk)
#   tools/embed.cjs          base64s it into dist/app.js, so the page makes no
#                            request at all and runs from file://
#   web/index.html           copied beside it
#   tools/smoke.cjs          the checks: seeds, gestures, discoveries, frame budget
set -euo pipefail
cd "$(dirname "$0")"

CC="${CC:-clang}"
WASM_FLAGS=(
  --target=wasm32 -nostdlib -ffreestanding -fno-builtin -O2
  -Wall -Wno-parentheses
  -Wl,--no-entry -Wl,--export-all -Wl,--export-memory
  -Wl,--initial-memory=4194304 -Wl,-z,stack-size=131072
)

mkdir -p build dist
echo "== toolchain =="
"$CC" --version | head -1
node --version
echo "== C -> wasm32 (no libc, no allocator) =="
"$CC" "${WASM_FLAGS[@]}" -o build/sim.wasm src/sim.c
ls -l build/sim.wasm
echo "== page =="
node tools/embed.cjs
cp web/index.html dist/index.html
test -s dist/index.html
test -s dist/app.js
echo "== checks =="
node tools/smoke.cjs
echo "ok: $(du -h dist/app.js | cut -f1) of page + dist/index.html"
