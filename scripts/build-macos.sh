#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"
echo "==> Building Saola for macOS..."
[ ! -d "node_modules" ] && npm install
CI=false npm run tauri build -- --bundles dmg,app
VERSION=$(grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' src-tauri/tauri.conf.json | cut -d'"' -f4)
BUNDLE_DIR="src-tauri/target/release/bundle"
RELEASE_DIR="release/${VERSION}/macos"
mkdir -p "$RELEASE_DIR"
for subdir in dmg macos; do
  [ -d "$BUNDLE_DIR/$subdir" ] && cp -r "$BUNDLE_DIR/$subdir"/* "$RELEASE_DIR/" 2>/dev/null || true
done
cp "$BUNDLE_DIR"/*.dmg "$RELEASE_DIR/" 2>/dev/null || true
echo "==> Done. macOS artifacts in $RELEASE_DIR/"
ls -la "$RELEASE_DIR" 2>/dev/null || true
