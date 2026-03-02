---
sidebar_position: 2
title: Installation
---

# Installation

Saola is distributed via [GitHub Releases](https://github.com/ashokdudhade/saola/releases). Download the installer for your platform from the latest release.

## Windows

1. Download the `.msi` or `.exe` installer from the release assets.
2. Run the installer and follow the prompts.
3. Launch Saola from the Start menu or desktop shortcut.

## macOS

**Which .dmg?**
- **Apple Silicon (M1, M2, M3)** → `Saola_*_aarch64.dmg`
- **Intel Mac** → `Saola_*_x64.dmg`

1. Download the correct `.dmg` from the release assets.
2. Open the `.dmg` and drag Saola to the Applications folder.
3. Launch Saola from Applications.

**If macOS blocks the app** ("cannot be verified"): Right-click the app → **Open** → **Open** again. Or **System Settings** → **Privacy & Security** → **Open Anyway**.

## Linux

### Debian / Ubuntu

```bash
# Download the .deb package from GitHub Releases, then:
sudo dpkg -i Saola_*_amd64.deb
```

### Fedora / RHEL

```bash
# Download the .rpm package from GitHub Releases, then:
sudo rpm -i Saola-*-1.x86_64.rpm
```
