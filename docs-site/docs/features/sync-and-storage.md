---
sidebar_position: 4
title: Sync & Storage
---

# Sync & Storage

Saola stores your collections locally and can sync to your own cloud storage. Your data stays under your control.

## Storage Providers

In **Settings** → **Storage**, choose the storage provider:

- **Local** — Data is stored only on your machine in the app data directory.
- **Google Drive** — Sync via the `appDataFolder` for privacy (OAuth flow).
- **S3** — Sync to an AWS S3 bucket using your own IAM credentials. Configure bucket, region, and access keys in settings.

## Export

Export your collections as JSON for backup or migration. You can download the full collections file.

## Encryption

Before syncing sensitive data, you can encrypt collections with a **Master Password**. Data is encrypted locally (AES-256-GCM) before being sent to the cloud, ensuring zero-knowledge: Saola never sees your plain-text data on the server. Use the encrypt/decrypt test in storage settings to verify the workflow.

## Sync (Push / Pull)

Use **Push** to upload local changes to the cloud provider, and **Pull** to download changes. Conflict resolution UI helps when multiple devices have modified the same collection.
