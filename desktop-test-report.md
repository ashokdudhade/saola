# Saola Desktop App — Test Report

**Date:** 2025-02-28

---

## Summary

| Item | Status |
|------|--------|
| Desktop E2E setup | ✅ Complete |
| tauri-driver | ✅ Installed |
| WebKitWebDriver | ❌ Not installed (blocker) |
| Desktop tests run | ❌ Blocked |

---

## What Was Done

1. **tauri-driver** — Installed via `cargo install tauri-driver --locked`

2. **WebdriverIO setup** — Added `e2e-desktop/` with:
   - `wdio.conf.js` — spawns tauri-driver, launches Saola binary
   - `specs/saola.e2e.js` — 6 tests: app load, sidebar, request builder, method dropdown, send request, tabs

3. **Build** — Frontend and Rust debug binary build successfully

---

## Blocker: WebKitWebDriver

Tauri desktop WebDriver tests require **WebKitWebDriver** on Linux. It is not installed in this environment.

**To enable desktop testing, run:**

```bash
sudo apt install webkit2gtk-driver
```

Then:

```bash
npm run test:desktop
```

---

## Test Suite (when WebKitWebDriver is available)

The desktop E2E suite covers:

1. App loads and shows main UI
2. Collections sidebar is visible
3. Request builder is visible (method, URL, send)
4. Method dropdown displays selected value
5. Send request and get response (Rust backend)
6. Request tabs work

---

## Comparison: Web vs Desktop Tests

| | Web (Playwright) | Desktop (WebdriverIO + tauri-driver) |
|---|-----------------|--------------------------------------|
| Target | localhost:5173 in Firefox | Tauri native window |
| Backend | Mock / fetch fallback | Real Rust invoke() |
| Status | ✅ 6/6 passing | ❌ Blocked on WebKitWebDriver |
