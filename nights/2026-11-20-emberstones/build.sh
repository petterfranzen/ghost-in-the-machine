#!/usr/bin/env bash
# Emberstones -> a static site in dist/.
#
#   C++ (freestanding)   src/*.cpp -> build/sim.wasm   (clang++ from wasi-sdk)
#   tools/embed.cjs      base64s it into dist/app.js, so the page makes no
#                        request at all and runs from file://
#   web/index.html       copied beside it
#   tools/smoke.cjs      the checks: rules, solver, gestures, frame budget
set -euo pipefail
cd "$(dirname "$0")"

CC="${CC:-clang++}"
SRC=(src/world.cpp src/rules.cpp src/draw.cpp)
WASM_FLAGS=(
  --target=wasm32 -nostdlib -ffreestanding -fno-builtin
  -fno-exceptions -fno-rtti -O2 -Wall -Wno-unused-function -Wno-unused-variable
  -Wl,--no-entry -Wl,--export-all -Wl,--export-memory
  -Wl,--initial-memory=4194304 -Wl,-z,stack-size=131072
)

mkdir -p build dist
echo "== toolchain =="
"$CC" --version | head -1
node --version
echo "== C++ -> wasm32 (no libc, no allocator) =="
"$CC" "${WASM_FLAGS[@]}" -o build/sim.wasm "${SRC[@]}"
ls -l build/sim.wasm
echo "== page =="
node tools/embed.cjs
cp web/index.html dist/index.html
test -s dist/index.html
test -s dist/app.js
echo "== checks =="
node tools/smoke.cjs
echo "ok: $(du -h dist/app.js | cut -f1) of page + dist/index.html"
