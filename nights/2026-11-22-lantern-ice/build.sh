#!/usr/bin/env bash
# Lantern Ice -> a static site in dist/.
#
#   V (pinned in mise.toml)   src/game.v  -> dist/game.js   the rules, one file
#   src/host/*.js             the picture, the sound and the input
#   src/index.html            the page
#   tools/smoke.js           the checks: solver, replay, bundle sanity
#
# game.js has no runtime: V -b js_browser emits plain browser JavaScript, and the
# page loads it before the host scripts so `main__boot` is there to call.
set -euo pipefail
cd "$(dirname "$0")"

V="${V:-v}"
HOST=(src/host/sound.js src/host/art.js src/host/paint.js src/host/bridge.js src/host/controls.js src/host/main.js)

mkdir -p dist/host
echo "== toolchain =="
"$V" version
node --version
echo "== V -> js_browser =="
"$V" -enable-globals -b js_browser -o dist/game.js src/game.v
echo "== page =="
cp src/index.html dist/index.html
for f in "${HOST[@]}"; do cp "$f" "dist/host/$(basename "$f")"; done
test -s dist/game.js
test -s dist/index.html
echo "== checks =="
node tools/smoke.js
echo "ok: $(du -h dist/game.js | cut -f1) of rules + $(du -sh dist | cut -f1) of site"
