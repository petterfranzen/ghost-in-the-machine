#!/usr/bin/env bash
# Builds Moonmirror Marsh into dist/ as a plain static site.
set -euo pipefail

# The sandbox has no libicu, and the app does not need cultures anyway.
export DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=1
export DOTNET_CLI_TELEMETRY_OPTOUT=1
export DOTNET_NOLOGO=1

cd "$(dirname "$0")"

if ! dotnet workload list 2>/dev/null | grep -q wasm-tools; then
  dotnet workload install wasm-tools
fi

# Smoke check first: an unsolvable level must never reach the browser.
dotnet run --project tools/validate -c Release

rm -rf dist publish
dotnet publish src -c Release -o publish

# Pages serves dist/ as it is with no compression, so keep only the plain files.
mkdir -p dist
cp -r publish/wwwroot/. dist/
find dist -name '*.br' -delete
find dist -name '*.gz' -delete
find dist -name '*.map' -delete
test -s dist/index.html
echo "dist/ is ready ($(du -sh dist | cut -f1))"
