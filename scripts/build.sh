#!/usr/bin/env bash
set -e
shopt -s nullglob 2>/dev/null || true
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"
echo "==> Building Saola..."
[ ! -d "node_modules" ] && npm install
# CI=false avoids Tauri CLI flag errors when CI is set in environment
# Allow partial success (e.g. deb/rpm succeed, AppImage fails on WSL)
CI=false npm run tauri build || true
VERSION=$(grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' src-tauri/tauri.conf.json | cut -d'"' -f4)
BUNDLE_DIR="src-tauri/target/release/bundle"
RELEASE_DIR="release/${VERSION}"
[ ! -d "$BUNDLE_DIR" ] && { echo "Error: Bundle not found at $BUNDLE_DIR"; exit 1; }
mkdir -p "$RELEASE_DIR"
for subdir in deb rpm appimage msi nsis dmg macos; do
  if [ -d "$BUNDLE_DIR/$subdir" ]; then
    mkdir -p "$RELEASE_DIR/$subdir"
    for f in "$BUNDLE_DIR/$subdir"/*.deb "$BUNDLE_DIR/$subdir"/*.rpm "$BUNDLE_DIR/$subdir"/*.AppImage "$BUNDLE_DIR/$subdir"/*.msi "$BUNDLE_DIR/$subdir"/*.exe "$BUNDLE_DIR/$subdir"/*.dmg; do
      [ -e "$f" ] && cp "$f" "$RELEASE_DIR/$subdir/" 2>/dev/null || true
    done
  fi
done
# Flatten: copy all artifacts to release root
for f in "$RELEASE_DIR"/*/*.deb "$RELEASE_DIR"/*/*.rpm "$RELEASE_DIR"/*/*.AppImage "$RELEASE_DIR"/*/*.msi "$RELEASE_DIR"/*/*.exe "$RELEASE_DIR"/*/*.dmg; do
  [ -e "$f" ] && cp "$f" "$RELEASE_DIR/" 2>/dev/null || true
done
echo "==> Done. Artifacts in $RELEASE_DIR/"
ls -la "$RELEASE_DIR" 2>/dev/null || find "$RELEASE_DIR" -type f
