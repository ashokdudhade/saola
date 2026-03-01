---
sidebar_position: 5
title: Request Logs
---

# Request Logs

Request logs give you a verbose view of each API call—similar to the browser DevTools Network panel or Postman Console.

## Call Logs

Every time you send a request, Saola records a log entry with:

- Timestamp
- Request ID (if linked to a collection request)
- Full outgoing request and incoming response

## Verbose Request View

For each log entry you can inspect:

- **Method** — HTTP method
- **Full URL** — Resolved URL after interpolation
- **Headers** — Final headers sent
- **Body** — Request body
- **Timing** — When the request was sent

## Verbose Response View

- **Status** — HTTP status code (color-coded: 2xx green, 3xx blue, 4xx orange, 5xx red)
- **Headers** — Response headers
- **Body** — Response body and size
- **Duration** — Request elapsed time in ms

The log viewer appears in a dockable panel or bottom drawer. You can filter by request, expand/collapse Request vs Response sections, and copy raw request/response data to the clipboard.
