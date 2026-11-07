#!/usr/bin/env bash
# Aurora Ridge — build a static dist/ from the Dart source and the house
# design system. Everything the page needs ends up in dist/: no fonts, no
# CDNs, no requests at all except the page itself.
# Run ./build.sh, then open dist/index.html.
set -euo pipefail

cd "$(dirname "$0")"
ROOT=$(pwd)
DIST="$ROOT/dist"
DESIGN="$ROOT/../../crew/design"

echo "→ clearing dist/"
rm -rf "$DIST" .build
mkdir -p "$DIST/design"

echo "→ copying the house design system (base, Section 9 theme, components)"
cp "$DESIGN/tokens/base.css" "$DESIGN/tokens/section9.css" "$DESIGN/components.css" "$DIST/design/"

echo "→ fetching Dart packages"
dart pub get --offline >/dev/null 2>&1 || dart pub get

echo "→ compiling Dart to JavaScript"
mkdir -p .build
dart compile js -O2 src/main.dart -o "$DIST/main.dart.js"
rm -f "$DIST/main.dart.js.deps" "$DIST/main.dart.js.map"

cp src/index.html src/style.css "$DIST/"

echo "→ checking the output"
node --check "$DIST/main.dart.js"
node tools/smoke.mjs "$DIST"

echo "→ dist/: $(find "$DIST" -type f | wc -l) files, $(du -sh "$DIST" | cut -f1)"
