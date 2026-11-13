#!/usr/bin/env bash
# Builds the static site in dist/. Needs .NET 8 and the Fable tool (see mise.toml).
set -euo pipefail
cd "$(dirname "$0")"

export TZ=UTC
export DOTNET_CLI_TELEMETRY_OPTOUT=1
export DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=1

dotnet tool restore
rm -rf js dist
dotnet fable src/App.fsproj -o js --noCache
mkdir -p dist
cp src/index.html src/style.css src/shell.js src/audio.js dist/
cp js/App.js dist/app.js
cp -r js/fable_modules dist/fable_modules
rm -rf dist/fable_modules/*/../.fable 2>/dev/null || true
echo "built dist/index.html"
