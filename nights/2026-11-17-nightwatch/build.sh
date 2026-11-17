#!/usr/bin/env bash
# Builds the static site into dist/: the Kotlin/JS compiler turns src/*.kt into
# dist/night.js, and the page it hangs on is copied beside it. The toolchain
# comes from mise.toml (java + kotlin 1.9.25) through `mise exec`; if neither is
# on the PATH the script falls back to the mise install tree so it also runs
# without mise in front of it.
set -euo pipefail
cd "$(dirname "$0")"

add_path() {
  case ":$PATH:" in *":$1:"*) return 0 ;; esac
  export PATH="$1:$PATH"
}

if ! command -v java >/dev/null 2>&1 || ! command -v kotlinc-js >/dev/null 2>&1; then
  for d in "$HOME"/.mise/installs/java/*/bin; do
    [ -x "$d/java" ] || continue
    add_path "$d"
    export JAVA_HOME="$(dirname "$d")"
  done
  for d in "$HOME"/.mise/installs/kotlin/*/kotlinc/bin; do
    [ -x "$d/kotlinc-js" ] || continue
    add_path "$d"
    break
  done
fi
command -v java >/dev/null 2>&1 || { echo "java not found (install it with: mise install)" >&2; exit 1; }
command -v kotlinc-js >/dev/null 2>&1 || { echo "kotlinc-js not found (install it with: mise install)" >&2; exit 1; }

KOTLIN_HOME="$(cd "$(dirname "$(command -v kotlinc-js)")/.." && pwd)"
STDLIB="$KOTLIN_HOME/lib/kotlin-stdlib-js.klib"
OUT="$(pwd)/dist"
KTOUT="$(pwd)/target/ktout"

rm -rf "$OUT" "$KTOUT"
mkdir -p "$OUT" "$KTOUT"

KOTLINC_JS="$(command -v kotlinc-js)"
echo "compiling src/*.kt with $KOTLIN_HOME"
kotlinc-js -Xir-produce-js \
  -ir-output-dir "$KTOUT" \
  -ir-output-name night \
  -libraries "$STDLIB" \
  -module-kind plain \
  -main call \
  src/*.kt

cp index.html "$OUT/index.html"
mv "$KTOUT/night.js" "$OUT/night.js"
rm -rf "$KTOUT"
echo "built dist/index.html + dist/night.js ($(wc -c < "$OUT/night.js") bytes)"
