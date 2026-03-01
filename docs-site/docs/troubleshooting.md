---
sidebar_position: 6
title: Troubleshooting
---

# Troubleshooting

## App won't start

- Ensure you have the required system dependencies. On Linux, install WebKit GTK and related libraries if prompted.
- Try running from the terminal to see any error messages.

## Requests fail or hang

- Check the URL and network connectivity.
- Verify that environment variables (if used) are defined in the active environment.
- Inspect the request logs for the actual request and response details.

## Collections or environments not loading

- Ensure the app has write access to the app data directory.
- Check that `collections.json` and `environments.json` are valid JSON. Corrupt files may need to be repaired or restored from backup.

## Sync issues (S3 / Google Drive)

- For S3: Verify bucket name, region, and IAM credentials. Ensure the bucket allows the configured operations.
- For Google Drive: Complete the OAuth flow and ensure the app has access to the app data folder.
- Use the encrypt/decrypt test in storage settings to confirm the master password works before syncing.

## Import fails

- Ensure the Postman export is in **Collection v2.1** format. Older formats are not supported.
- Check that the JSON file is valid and not truncated.
