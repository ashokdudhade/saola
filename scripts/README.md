# Saola Build Scripts

Bash scripts to create installable distributions for Saola.

## Prerequisites

- Node.js and npm
- Rust toolchain
- Tauri CLI (via npm install)
- **Windows:** WiX Toolset (MSI), NSIS — build Linux packages requires WSL
- **Linux:** dpkg, rpm; appimagebuild for AppImage
- **macOS:** Xcode Command Line Tools

## Scripts

| Script | Description |
|--------|-------------|
| build.sh | Build for current platform; copies to release/ |
| build-linux.sh | Linux: deb, appimage, rpm |
| build-windows.sh | Windows: msi, nsis |
| build-macos.sh | macOS: dmg, app |
| build-all.sh | Auto-detect platform and build |

## Usage

**Recommended (works on Windows, macOS, Linux):**

```bash
npm run build:windows   # Windows: .msi, .exe (run on Windows)
npm run build:linux     # Linux: .deb, .rpm, .AppImage (run on Linux or WSL)
npm run build:macos     # macOS: .dmg, .app (run on macOS)
npm run build:dist      # Build for current platform
```

**Note:** Linux packages (deb, rpm, AppImage) cannot be built natively on Windows. Use WSL to run `npm run build:linux`.

## Output

Artifacts in `release/<version>/` with platform subdirs.

## CI

Scripts clear `CI` to avoid Tauri CLI errors. For GitHub Actions: `BUILD_PLATFORM=linux ./scripts/build-all.sh`.
