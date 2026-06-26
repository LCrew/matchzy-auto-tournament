#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SPARKOO_DIR="${SPARKOO_DIR:-/tmp/csgo-2d-demo-viewer}"
OUT_DIR="$REPO_ROOT/client/public/demo-player"

if ! command -v go &>/dev/null; then
  echo "Error: Go is not installed. Run: brew install go" >&2
  exit 1
fi

echo "=== Building WASM parser ==="
cd "$SPARKOO_DIR"
make wasm

# wasm_exec.js must be explicitly copied alongside the wasm binary
GOROOT="$(go env GOROOT)"
cp "$GOROOT/lib/wasm/wasm_exec.js" "$SPARKOO_DIR/web/public/wasm/wasm_exec.js"

echo "=== Building Preact frontend ==="
cd "$SPARKOO_DIR/web"
npm ci
npm run build

echo "=== Copying to MAT ==="
rm -rf "$OUT_DIR"
cp -r "$SPARKOO_DIR/web/dist" "$OUT_DIR"
cp "$GOROOT/lib/wasm/wasm_exec.js" "$OUT_DIR/wasm/wasm_exec.js"

echo "Done → $OUT_DIR"
echo "Run 'yarn build' (or 'yarn docker:local:rebuild') to include it in the production bundle."
