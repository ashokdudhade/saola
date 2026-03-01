---
sidebar_position: 2
title: Request Builder
---

# Request Builder

The request builder lets you configure and send HTTP requests. It includes the method selector, URL input, and tabs for params, headers, auth, and body.

## Method

Select the HTTP method from the dropdown: **GET**, **POST**, **PUT**, **PATCH**, **DELETE**, **HEAD**, or **OPTIONS**.

## URL

Enter the full URL in the URL input (e.g. `https://httpbin.org/get`). You can use `{{variable}}` for environment variable interpolation.

## Params

In the **Params** tab, add key-value query parameters. Toggle each param on or off. Values are appended to the URL when the request is sent.

## Headers

In the **Headers** tab, add HTTP headers as key-value pairs. Toggle each header on or off.

## Body

For **POST**, **PUT**, and **PATCH** requests, use the **Body** tab to edit JSON or plain text. The body editor uses CodeMirror.

## Send

Click **Send** or press `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows/Linux) to execute the request. The response appears in the right panel with status, headers, and body.
