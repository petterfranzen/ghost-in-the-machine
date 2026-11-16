#!/usr/bin/env bash
# Builds the static site into dist/. Requirements: a JDK and Maven (see
# mise.toml). Maven is used only to put the ClojureScript compiler and its
# dependencies on a classpath; cljs.main then compiles src/ to dist/app.js.
set -euo pipefail
cd "$(dirname "$0")"

# mise exec normally provides these; fall back to the mise install tree so the
# script also works when it is called without mise on the PATH.
for tool in java maven; do
  command -v "$tool" >/dev/null 2>&1 && continue
  for d in "$HOME"/.mise/installs/"$tool"/*/bin "$HOME"/.mise/installs/"$tool"/*/*/bin; do
    [ -d "$d" ] || continue
    case "$d" in *maven*) [ -x "$d/mvn" ] || continue ;; *) [ -x "$d/java" ] || continue ;; esac
    export PATH="$d:$PATH"
    break
  done
done
command -v java >/dev/null 2>&1 || { echo "java not found (install it with: mise install)" >&2; exit 1; }
command -v mvn  >/dev/null 2>&1 || { echo "mvn not found (install it with: mise install)" >&2; exit 1; }

mkdir -p target
echo "resolving the ClojureScript compiler with maven"
mvn -q -B -DincludeScope=runtime dependency:build-classpath -Dmdep.outputFile=target/cp.txt >/dev/null

echo "compiling clojurescript"
java -cp "$(cat target/cp.txt):src" clojure.main -m cljs.main \
  -co '{:optimizations :advanced
        :infer-externs true
        :output-to "dist/app.js"
        :output-dir "target/cljs"
        :target :browser
        :pretty-print false}' \
  -c fairy-ring.core

cp index.html dist/index.html
rm -f dist/*.map
echo "built dist/index.html + dist/app.js ($(wc -c < dist/app.js) bytes)"
