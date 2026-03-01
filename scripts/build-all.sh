#!/usr/bin/env bash
# Detect platform and run the appropriate build script.
# For CI: set BUILD_PLATFORM=linux|windows|macos to force a specific platform.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Allow override via env (for CI)
if [ -n "$BUILD_PLATFORM" ]; then
  PLATFORM="$BUILD_PLATFORM"
else
  case "$(uname -s)" in
    Linux*)   PLATFORM=linux ;;
    Darwin*)  PLATFORM=macos ;;
    MINGW*|MSYS*|CYGWIN*) PLATFORM=windows ;;
    *)        echo "Unknown platform: $(uname -s)"; exit 1 ;;
  esac
fi

echo "==> Detected platform: $PLATFORM"
"$SCRIPT_DIR/build-$PLATFORM.sh"
