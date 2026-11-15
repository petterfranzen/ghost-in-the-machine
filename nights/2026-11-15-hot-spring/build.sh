#!/usr/bin/env bash
# Builds the static site into dist/. Requirements: the Dart SDK (see mise.toml).
set -euo pipefail
cd "$(dirname "$0")"

if ! command -v dart >/dev/null 2>&1; then
  for d in "$HOME"/.mise/installs/dart/*/bin; do
    if [ -x "$d/dart" ]; then export PATH="$d:$PATH"; break; fi
  done
fi
command -v dart >/dev/null 2>&1 || { echo "dart not found (install it with: mise install)" >&2; exit 1; }

rm -rf dist
mkdir -p dist
dart compile js -O2 -o dist/main.dart.js web/main.dart
cp index.html dist/index.html
rm -f dist/*.map dist/*.unopt.js dist/*.deps
echo "built dist/index.html + dist/main.dart.js"
