#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$REPO_ROOT/client/public/demo-player"

# Use the local source copy if present, otherwise fall back to an external clone
LOCAL_SRC="$REPO_ROOT/demo-player-src"
if [ -z "${SPARKOO_DIR:-}" ]; then
  if [ -d "$LOCAL_SRC" ]; then
    SPARKOO_DIR="$LOCAL_SRC"
    LOCAL_BUILD=1
  else
    SPARKOO_DIR="/tmp/csgo-2d-demo-viewer"
    LOCAL_BUILD=0
  fi
else
  LOCAL_BUILD=0
fi

if [ "$LOCAL_BUILD" -eq 1 ]; then
  echo "=== Using local demo-player-src (skipping WASM build) ==="
  WEB_DIR="$SPARKOO_DIR"
else
  if ! command -v go &>/dev/null; then
    echo "Error: Go is not installed. Run: brew install go" >&2
    exit 1
  fi
  echo "=== Building WASM parser ==="
  cd "$SPARKOO_DIR"
  make wasm
  GOROOT="$(go env GOROOT)"
  cp "$GOROOT/lib/wasm/wasm_exec.js" "$SPARKOO_DIR/web/public/wasm/wasm_exec.js"
  WEB_DIR="$SPARKOO_DIR/web"
fi

echo "=== Building Preact frontend ==="
cd "$WEB_DIR"
npm ci
npm run build

echo "=== Copying to MAT ==="
rm -rf "$OUT_DIR"
cp -r "$WEB_DIR/dist" "$OUT_DIR"

if [ "$LOCAL_BUILD" -eq 0 ]; then
  GOROOT="$(go env GOROOT)"
  cp "$GOROOT/lib/wasm/wasm_exec.js" "$OUT_DIR/wasm/wasm_exec.js"
fi

echo "Done → $OUT_DIR"
echo "Run 'yarn build' (or 'yarn docker:local:rebuild') to include it in the production bundle."
