#!/usr/bin/env bash
# Build Fireflies: compile the Elm source to JavaScript and refresh dist/.
set -euo pipefail
cd "$(dirname "$0")"

# Prefer elm on PATH (CI installs it from mise.toml); fall back to mise exec.
if command -v elm >/dev/null 2>&1; then
  ELM="elm"
elif command -v mise >/dev/null 2>&1; then
  ELM="mise exec -- elm"
else
  echo "error: elm not found (install via 'mise install')" >&2
  exit 1
fi

mkdir -p dist
cp src/index.html dist/index.html
$ELM make src/Main.elm --output=dist/app.js --optimize

# Smoke checks: the artefacts Pages serves must exist and look right.
test -s dist/index.html
test -s dist/app.js
grep -q 'id="stage"' dist/index.html
grep -q 'Elm.Main.init' dist/index.html
grep -q 'radialGradient' dist/app.js
grep -q 'glowWarm' dist/app.js
grep -q 'pointerdown' dist/app.js
grep -q 'mix-blend-mode' dist/app.js

echo "built dist/index.html + dist/app.js ($(wc -c < dist/app.js) bytes of JS)"
