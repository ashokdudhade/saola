---
sidebar_position: 6
title: Code Snippets
---

# Code Snippets

Generate ready-to-run code from any request configured in Saola. Use the **Code** button in the request builder to open the code snippet modal.

## Supported Languages

- **cURL** — Command-line curl
- **JavaScript (fetch)** — Browser `fetch` API
- **Python (requests)** — Python `requests` library

## How It Works

1. Configure your request (method, URL, params, headers, body).
2. Click the **Code** button.
3. Choose the language from the selector.
4. Copy the generated snippet to the clipboard.

The snippet includes the current method, full URL (with params), headers, and body. When an environment is active, variables are replaced with their resolved values.
