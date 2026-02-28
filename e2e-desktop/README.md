# Saola Desktop E2E Tests

Tests the actual Tauri desktop app via WebDriver (not the web UI).

## Requirements

1. **tauri-driver** (already installed):
   ```bash
   cargo install tauri-driver --locked
   ```

2. **WebKitWebDriver** (Linux only). Install:
   ```bash
   sudo apt install webkit2gtk-driver
   ```

## Run Tests

```bash
npm run test:desktop
```

Or from this directory:

```bash
cd e2e-desktop && npm test
```

## Note

On WSL2, you may need an X server (WSLg, VcXsrv, etc.) for the desktop app window to display. The tests can still run in headless mode if WebKitWebDriver is available.
