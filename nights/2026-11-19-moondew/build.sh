#!/usr/bin/env bash
# Moondew - compile the OCaml game to a static site in dist/.
set -euo pipefail
cd "$(dirname "$0")"

export OPAMROOT="${OPAMROOT:-$HOME/.opam}"
export OPAMYES=1

if ! command -v opam >/dev/null 2>&1; then
  echo "build.sh needs opam on PATH (mise.toml installs it)" >&2
  exit 1
fi

[ -d "$OPAMROOT/default" ] || opam init --bare --disable-sandboxing -y

# Prefer the night's own local switch.  Failing that, reuse whichever switch is
# already selected (developing the night by hand), and otherwise build one here
# - that is the CI path, and the first run pays for the compiler.
if [ -d _opam ]; then
  eval "$(opam env --switch=. --set-switch)"
elif opam switch show >/dev/null 2>&1 && opam exec -- ocamlc -version >/dev/null 2>&1; then
  eval "$(opam env)"
else
  opam switch create . ocaml-base-compiler.5.2.1 -y
  eval "$(opam env --switch=. --set-switch)"
fi

opam install -y dune js_of_ocaml >/dev/null

dune build --profile release src/main.bc.js

mkdir -p dist
# dune writes its js read-only, so take the old copies away first
rm -f dist/index.html dist/style.css dist/moondew.js
cp index.html style.css dist/
cp _build/default/src/main.bc.js dist/moondew.js
chmod 644 dist/*
echo "built dist/ from $(ocamlc -version)"
