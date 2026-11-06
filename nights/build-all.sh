#!/usr/bin/env bash
# Build every night in this repo with its own pinned toolchain and print one
# PASS/FAIL line per night. Run from anywhere; it walks to the repo root.
#
#   bash nights/build-all.sh            # all nights
#   bash nights/build-all.sh 2026-11-05-songbranch   # one or more nights
#
# Exit status is 0 only when every night built. CI builds changed nights on
# every PR; this script is for rebuilding all of them by hand (a toolchain
# bump, a Pages problem) and pasting the result into the PR description.
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1
ROOT=$(pwd)

if [ "$#" -gt 0 ]; then
  nights=("$@")
else
  nights=()
  for d in nights/*/; do
    [ -f "$d/build.sh" ] || continue
    nights+=("$(basename "$d")")
  done
fi

pass=0; fail=0; failed=()
for n in "${nights[@]}"; do
  d="nights/$n"
  if [ ! -f "$d/build.sh" ]; then
    printf 'FAIL  %-28s (no build.sh)\n' "$n"; fail=$((fail+1)); failed+=("$n"); continue
  fi
  log=$(mktemp)
  (
    cd "$d" || exit 1
    if [ -f mise.toml ] || [ -f .mise.toml ] || [ -f .tool-versions ]; then
      mise trust -a >/dev/null 2>&1
      mise install >/dev/null 2>&1 || { echo "mise install failed"; exit 1; }
    fi
    mise exec -- bash build.sh
  ) >"$log" 2>&1
  rc=$?
  nodev=$( ( cd "$d" && mise exec -- node -v ) 2>/dev/null || echo "n/a" )
  if [ "$rc" -eq 0 ] && [ -s "$d/dist/index.html" ]; then
    printf 'PASS  %-28s node %s\n' "$n" "$nodev"
    pass=$((pass+1))
  else
    printf 'FAIL  %-28s node %s  (see log below)\n' "$n" "$nodev"
    fail=$((fail+1)); failed+=("$n")
    sed 's/^/      | /' "$log" | tail -40
  fi
  rm -f "$log"
done

echo
echo "nights built: $pass passed, $fail failed"
if [ "$fail" -gt 0 ]; then printf 'failed: %s\n' "${failed[*]}"; exit 1; fi
