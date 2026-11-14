#!/usr/bin/env bash
# Build Lantern Alley -> a static site in dist/.
#
#   Scala (Scala.js)   src/*.scala -> dist/main.js  (one plain script, no bundler)
#   index.html         copied next to it; dist/ is what Pages publishes
set -euo pipefail
cd "$(dirname "$0")"

# scala-cli keeps its local state under XDG_DATA_HOME; fall back to a writable
# spot if that directory is not ours (some sandboxes make ~/.local/share root-owned).
export XDG_DATA_HOME="${XDG_DATA_HOME:-$HOME/.local/share}"
if [ ! -w "$XDG_DATA_HOME" ] 2>/dev/null; then export XDG_DATA_HOME="$HOME/.cache/scalacli-data"; fi
mkdir -p "$XDG_DATA_HOME"

echo "== toolchain =="
scala-cli version 2>&1 | head -2

echo "== compile (Scala -> Scala.js) =="
mkdir -p dist
scala-cli --power package src \
  --js --js-module-kind none \
  -o dist/main.js -f

echo "== page =="
cp index.html dist/index.html
test -s dist/index.html
test -s dist/main.js
echo "ok: $(du -h dist/main.js | cut -f1) of JavaScript + dist/index.html"
