#!/usr/bin/env bash
# Build Zen Rake: compile the Haxe source to JavaScript and refresh dist/.
set -euo pipefail
cd "$(dirname "$0")"

# Prefer haxe on PATH (CI installs it from mise.toml); fall back to mise exec.
if command -v haxe >/dev/null 2>&1; then
  HAXE="haxe"
elif command -v mise >/dev/null 2>&1; then
  HAXE="mise exec -- haxe"
else
  echo "error: haxe not found (install via 'mise install')" >&2
  exit 1
fi

mkdir -p dist
cp src/index.html dist/index.html
$HAXE -cp src -main Main -js dist/app.js

# Smoke checks: the artefacts Pages serves must exist and look right.
test -s dist/index.html
test -s dist/app.js
grep -q 'id="sand"' dist/index.html
grep -q 'id="marks"' dist/index.html
grep -q 'getContext' dist/app.js
grep -q 'createRadialGradient' dist/app.js

echo "built dist/index.html + dist/app.js ($(wc -c < dist/app.js) bytes of JS)"
