---
sidebar_position: 3
title: Environments
---

# Environments

Environments let you define variables that change per environment (e.g. dev, staging, prod). Variables are interpolated before each request is sent.

## Managing Environments

Open **Settings** (gear icon) and go to the **Environments** section. You can:

- **Create** — Add a new environment with a name.
- **Edit** — Add, edit, or remove variables (key/value pairs).
- **Delete** — Remove an environment (with confirmation).
- **Set active** — Select the active environment from the dropdown. Only one environment is active at a time.

## Variable Interpolation

Use `{{varName}}` syntax anywhere in your request:

- **URL** — `https://{{baseUrl}}/api/users`
- **Headers** — `Authorization: Bearer {{token}}`
- **Body** — `{"userId": "{{userId}}"}`

When you send a request, `{{varName}}` is replaced with the value from the active environment.
