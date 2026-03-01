---
sidebar_position: 3
title: Data Storage
---

# Data Storage

Saola stores data in platform-specific app data directories. Files are created automatically when you first use the app.

## File Locations

| File | Purpose |
|------|---------|
| `collections.json` | All collections, folders, and requests |
| `environments.json` | Environment definitions and variables |
| `active_environment.txt` | ID of the currently active environment |

## Platform Paths

- **Linux** — `~/.local/share/saola/`
- **macOS** — `~/Library/Application Support/saola/`
- **Windows** — `%APPDATA%\saola\`

Example on Linux:

```
~/.local/share/saola/collections.json
~/.local/share/saola/environments.json
```
