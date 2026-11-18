#!/usr/bin/env bash
# Compiles the Java simulation to a single JavaScript file with TeaVM and
# assembles the static site in dist/.
set -euo pipefail
cd "$(dirname "$0")"

# mise exec puts these on PATH; when run bare, fall back to the mise installs.
if ! command -v mvn >/dev/null 2>&1 && command -v mise >/dev/null 2>&1; then
  export JAVA_HOME="$(mise where java)"
  export PATH="$(mise where maven)/bin:$JAVA_HOME/bin:$PATH"
fi

mvn -B -q package

rm -rf dist
mkdir -p dist
cp src/web/index.html dist/index.html
cp target/web/app.js dist/app.js
echo "built dist/index.html ($(wc -c < dist/app.js) bytes of JavaScript)"
