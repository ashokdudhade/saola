#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"
echo "==> Building Saola for Windows..."
[ ! -d "node_modules" ] && npm install
CI=false npm run tauri build -- --bundles msi,nsis
VERSION=$(grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' src-tauri/tauri.conf.json | cut -d'"' -f4)
BUNDLE_DIR="src-tauri/target/release/bundle"
RELEASE_DIR="release/${VERSION}/windows"
mkdir -p "$RELEASE_DIR"
for subdir in msi nsis; do
  [ -d "$BUNDLE_DIR/$subdir" ] && cp -r "$BUNDLE_DIR/$subdir"/* "$RELEASE_DIR/" 2>/dev/null || true
done
cp "$BUNDLE_DIR"/*.msi "$RELEASE_DIR/" 2>/dev/null || true
cp "$BUNDLE_DIR"/*.exe "$RELEASE_DIR/" 2>/dev/null || true
echo "==> Done. Windows artifacts in $RELEASE_DIR/"
ls -la "$RELEASE_DIR" 2>/dev/null || true
