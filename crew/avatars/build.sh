#!/bin/sh
# Build the crew avatars.
#
#   SVG sources are the truth: generate.py writes them.
#   export.mjs rasterizes each to a 256x256 PNG in a headless browser, so the
#   raster can never drift from the drawing.
#   oxipng (pinned in mise.toml) losslessly shrinks the PNGs under the 50 KB cap.
#
# CI does not run this; the committed SVG/PNG/index.html are the shipped assets.
# Run it after editing generate.py and commit the refreshed outputs.
set -eu
cd "$(dirname "$0")"

python3 generate.py

if command -v node >/dev/null 2>&1; then
  export PLAYWRIGHT_BROWSERS_PATH="${PLAYWRIGHT_BROWSERS_PATH:-/opt/ms-playwright}"
  export NODE_PATH="${NODE_PATH:-/usr/local/lib/node_modules}"
  # one browser at a time on this VM
  exec 9>/tmp/browser.lock
  flock -w 300 9 || { echo "build.sh: browser busy; try later" >&2; exit 75; }
  node export.mjs
else
  echo "build.sh: no node, skipping PNG export" >&2
fi

if command -v oxipng >/dev/null 2>&1; then
  oxipng -o 4 -s ./*.png
else
  echo "build.sh: no oxipng, PNGs left unoptimized (may exceed 50 KB)" >&2
fi

fail=0
for f in *.svg *.png; do
  s=$(wc -c < "$f")
  if [ "$s" -ge 51200 ]; then echo "build.sh: $f is $s bytes (limit 51200)" >&2; fail=1; fi
done
[ "$fail" -eq 0 ] && echo "build.sh: all assets under 50 KB"
exit "$fail"
