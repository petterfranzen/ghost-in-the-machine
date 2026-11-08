#!/usr/bin/env bash
# Build Dune Drift -> a static site in dist/.
#
#   npm ci                 # install the pinned AssemblyScript compiler
#   asc                    # compile the simulation to WebAssembly
#   tools/embed.mjs        # fold the wasm and the host into dist/app.js
set -euo pipefail
cd "$(dirname "$0")"

echo "== install =="
npm ci --no-audit --no-fund

echo "== compile (AssemblyScript -> WebAssembly) =="
mkdir -p build dist
npx asc src/sim.ts \
  --outFile build/sim.wasm \
  --optimize \
  --runtime stub \
  --exportRuntime

echo "== smoke (the simulation in plain Node) =="
node tools/smoke.mjs build/sim.wasm

echo "== bundle =="
node tools/embed.mjs

test -s dist/index.html
echo "ok: $(du -h dist/app.js | cut -f1) app.js + dist/index.html"
