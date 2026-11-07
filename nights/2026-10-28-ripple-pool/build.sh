#!/usr/bin/env bash
# Build Ripple Pool: compile the Nim source to JavaScript and refresh dist/.
set -euo pipefail
cd "$(dirname "$0")"

# Prefer nim on PATH (CI installs it from mise.toml); fall back to mise exec.
if command -v nim >/dev/null 2>&1; then
  NIM="nim"
elif command -v mise >/dev/null 2>&1; then
  NIM="mise exec -- nim"
else
  echo "error: nim not found (install via 'mise install')" >&2
  exit 1
fi

mkdir -p dist
cp src/index.html dist/index.html
$NIM js -d:release --out:dist/app.js src/main.nim

# Copy the shared nights helper in, so dist/ is self-contained and Pages needs
# nothing from outside the night folder (see nights/_shared/README.md).
cp ../_shared/interact.js dist/interact.js

# Smoke checks: the artefacts Pages serves must exist and look right.
test -f dist/index.html
test -f dist/app.js
test -s dist/interact.js
grep -q 'id="pool"' dist/index.html
grep -q 'getContext' dist/app.js
grep -q './interact.js' dist/index.html
grep -q 'export function nudge' dist/interact.js

echo "built dist/index.html + dist/app.js + dist/interact.js"
