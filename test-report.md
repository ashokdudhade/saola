# Saola — Automated Test Report

**Date:** 2025-02-28  
**Environment:** WSL2, Node, Tauri, Firefox (Playwright), WebdriverIO (Desktop)

---

## Summary

| Metric | Result |
|--------|--------|
| Build | ✅ Pass |
| Web E2E (Playwright) | ✅ 6/6 Pass |
| Desktop E2E (WebdriverIO) | ✅ 6/6 Pass |

---

## Build

```
tsc -b && vite build
✓ 65 modules transformed
✓ dist/ built in 3.11s
```

---

## E2E Tests (Playwright / Firefox)

| # | Test | Result | Time |
|---|------|--------|------|
| 1 | App loads and shows main UI | ✅ Pass | 2.3s |
| 2 | Collections sidebar is visible | ✅ Pass | 737ms |
| 3 | Request builder visible (method, URL, send) | ✅ Pass | 731ms |
| 4 | Method dropdown displays selected value | ✅ Pass | 744ms |
| 5 | Send request and get response | ✅ Pass | 3.8s |
| 6 | Request tabs work | ✅ Pass | 760ms |

---

## Desktop E2E Tests (WebdriverIO + tauri-driver)

| # | Test | Result |
|---|------|--------|
| 1 | App loads and shows main UI | ✅ Pass |
| 2 | Collections sidebar is visible | ✅ Pass |
| 3 | Request builder visible | ✅ Pass |
| 4 | Method dropdown displays selected value | ✅ Pass |
| 5 | Send request and get response (Rust backend) | ✅ Pass |
| 6 | Request tabs work | ✅ Pass |

---

## Conclusion

All automated checks passed. **Web tests** run against localhost in Firefox. **Desktop tests** run against the actual Tauri window and Rust backend. The app builds, main UI loads, Collections sidebar and request builder work, method dropdown shows the selected value, HTTP requests are sent via Rust, and tab management works.
