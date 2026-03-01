# Saola — Core Features Reference

Use this document as a checklist when testing all core features of the desktop application.

---

## 1. Application Shell

| Feature | How to Test | Selector / Location |
|---------|-------------|---------------------|
| App loads | Launch app; verify main layout visible | `.app` |
| App title | Header shows "Saola" | `.app-title` |
| Sidebar toggle | Click ☰/✕ or press `Ctrl+\` | `.sidebar-toggle` |
| Settings panel | Click gear icon; panel opens | `.settings-btn` → `.settings-panel` |
| Global search | Press `Cmd/Ctrl+P` | `.global-search` (opens) |

---

## 2. Collections Sidebar

| Feature | How to Test | Selector / Location |
|---------|-------------|---------------------|
| Sidebar visible | Sidebar displays with "COLLECTIONS" header | `.sidebar`, `.sidebar-header` |
| Create collection (+) | Click "+ New" in header | `.sidebar-new-btn` |
| Empty state | With no collections, see "Create collection" CTA | `.sidebar-empty`, `.sidebar-empty-btn` |
| Collection tree | Expand collections; see folders and requests | `.collection-folder`, `.collection-request` |
| Select request | Click a request; loads into active tab and links | — |
| Context menu (collection) | Right-click collection → New Folder, New Request, Rename, Delete | — |
| Context menu (folder) | Right-click folder → New Folder, New Request, Rename, Delete | — |
| Context menu (request) | Right-click request → Rename, Delete, Duplicate | — |
| New Collection (context) | Right-click sidebar content → New Collection | — |

---

## 3. Request Builder

| Feature | How to Test | Selector / Location |
|---------|-------------|---------------------|
| Method dropdown | Select GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS | `.method-select` |
| URL input | Enter URL (e.g. `https://httpbin.org/get`) | `.url-input` |
| Params tab | Add/remove key-value params; toggle enabled | `.kv-list` in Params |
| Headers tab | Add/remove headers; toggle enabled | `.kv-list` in Headers |
| Auth tab | Placeholder (OAuth/S3 config in settings) | — |
| Body tab | Edit JSON/text body for POST/PUT/PATCH | CodeMirror in Body |
| Send button | Click or `Cmd/Ctrl+Enter` | `.send-btn` |
| Code button | Generate code snippet (cURL, fetch, Python) | `.code-btn` |
| Save button | Save linked request or open Save modal | — |
| Save as button | Open Save modal to save as new request | — |

---

## 4. Request Tabs

| Feature | How to Test | Selector / Location |
|---------|-------------|---------------------|
| New tab | Click "+" to add tab | `.tab-new` |
| Switch tab | Click tab to activate | `.request-tab` |
| Close tab | Click × on tab | — |
| Tab linking | Select request from sidebar; tab links to that request | — |
| Tab count | Multiple tabs visible | `$$('.request-tab')` |

---

## 5. Response View

| Feature | How to Test | Selector / Location |
|---------|-------------|---------------------|
| Placeholder | Before send: "Send a request to see the response" | `.response-placeholder` |
| Loading state | While request in progress: "Loading response..." | `.response-loading` |
| Status badge | After send: HTTP status (e.g. 200, 404) | `.status-badge` |
| Status colors | 2xx green, 3xx blue, 4xx orange, 5xx red | `.status-2xx`, `.status-4xx`, etc. |
| Response body | JSON/plain text in CodeMirror | `.response-view` |
| Error display | Network/backend errors shown | `.response-error` |

---

## 6. Save to Collection

| Feature | How to Test | Selector / Location |
|---------|-------------|---------------------|
| Save modal (unlinked) | Cmd+S or Save when tab not linked → modal opens | `SaveToCollectionModal` |
| Save modal (Save as) | Save as → choose location, name | — |
| Choose collection/folder | Select target from tree in modal | — |
| Save in place | For linked tab, Cmd+S saves directly | — |

---

## 7. Environments & Variables

| Feature | How to Test | Selector / Location |
|---------|-------------|---------------------|
| Environment manager | Settings panel → Environments section | `.environment-manager` |
| Create environment | Create new; prompt for name | — |
| Edit environment | Edit variables (key/value pairs) | — |
| Delete environment | Delete with confirmation | — |
| Set active | Select environment from dropdown | — |
| Variable interpolation | Use `{{varName}}` in URL, headers, body → replaced before send | — |

---

## 8. Storage Settings

| Feature | How to Test | Selector / Location |
|---------|-------------|---------------------|
| Storage settings | Settings panel → Storage section | `.storage-settings` |
| Provider toggle | Local / Google Drive / S3 | — |
| S3 config | Enter bucket, region, keys; Save | `configure_s3` |
| Postman import | Select Postman v2.1 JSON; Import (append/replace) | — |
| Encrypt test | Enter master password; run encrypt/decrypt test | `encrypt_collections`, `decrypt_collections` |
| Sync push/pull | Click Push/Pull (stubs for now) | `sync_push`, `sync_pull` |

---

## 9. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + Enter` | Send request |
| `Cmd/Ctrl + S` | Save request to collection |
| `Cmd/Ctrl + \` | Toggle sidebar |
| `Cmd/Ctrl + P` | Toggle global search |

---

## 10. Tauri Commands (Backend)

| Command | Purpose |
|---------|---------|
| `get_collections` | Load collections from local JSON |
| `create_collection` | Create top-level collection |
| `create_folder` | Create folder under collection/folder |
| `save_request` | Add or update request |
| `rename_item` | Rename collection/folder/request |
| `delete_item` | Delete item (folder deletes children) |
| `import_postman` | Import Postman v2.1 JSON (append/replace) |
| `send_request` | Execute HTTP request (with interpolation) |
| `get_environments` | List environments |
| `get_active_environment` | Get active environment |
| `create_environment` | Create environment |
| `update_environment` | Update environment |
| `delete_environment` | Delete environment |
| `set_active_environment` | Set active environment |
| `configure_s3` | Configure S3 credentials |
| `encrypt_collections` | Encrypt JSON with master password |
| `decrypt_collections` | Decrypt with master password |
| `sync_push` | Push to cloud (stub) |
| `sync_pull` | Pull from cloud (stub) |

---

## 11. Data Persistence

| Storage | Location |
|---------|----------|
| Collections | `~/.local/share/saola/collections.json` (Linux) |
| Environments | `~/.local/share/saola/environments.json` |
| Active environment | `~/.local/share/saola/active_environment.txt` |

---

## 12. E2E Test Coverage

**Desktop (WebdriverIO + tauri-driver):** `npm run test:desktop`

| Test | Description |
|------|-------------|
| App loads and shows main UI | `.app`, title "Saola" |
| Response placeholder before first send | `.response-placeholder` visible |
| Collections sidebar visible | `.sidebar`, header contains "COLLECTIONS" |
| Request builder visible | `.request-line`, `.method-select`, `.url-input`, `.send-btn` |
| Method dropdown | Select POST, verify value |
| Send request and get response | GET to httpbin; expect 2xx status |
| Request tabs work | Click new tab; ≥2 tabs |
| Create collection button visible | `.sidebar-new-btn` |
| Settings panel opens | Click gear; `.environment-manager`, `.storage-settings` |
| Settings panel closes | Toggle off; env manager not displayed |
| Sidebar toggle | Collapse/expand sidebar via `.sidebar-toggle` |
| Global search | Ctrl+P opens `.global-search-overlay` |
| Params, Headers, Body tabs | Click tabs; verify `.kv-list`, `.body-editor` / `.cm-editor` |
| Save button | `.save-btn` visible (Save as when tab linked) |
| Save modal | Ctrl+S opens modal; Cancel to close |
| Switch tabs | Click second tab; verify `.request-tab.active` |
| Close tab | Click `.request-tab-close`; tab count decreases |
| Ctrl+Enter sends request | Keyboard shortcut; status badge 2xx with `.status-2xx` |
| Storage provider options | `.provider-options` with Local/Google Drive/S3 |
| **Collection management** | |
| Create collection via + New | Stub `window.prompt`, click `.sidebar-new-btn`; verify `.collection` |
| Save request to collection | Set URL, Ctrl+S, fill name, Save; verify `.collection-request` |
| Create folder via context menu | Right-click `.collection`, New Folder (when context menu available) |
| Create request via New Request | Right-click collection, New Request (when context menu available) |

**Web (Playwright):** `npx playwright test`

| Test | Description |
|------|-------------|
| App loads | `.app`, title "Saola" |
| Sidebar visible | `.sidebar`, "Collections" |
| Request builder | Method select, URL input, Send button |
| Method dropdown | Select POST |
| Send request | Expect 2xx status badge |
| Tabs | New tab creates second tab |
| Code snippet | Click `.code-btn`; modal shows curl/fetch/requests; Copy works |

**Manual testing** (native dialogs block automation):

- Create collection (+ New, Create collection, right-click → New Collection)
- Context menus: New Folder, New Request, Rename, Delete, Duplicate
- Environment create/edit (prompts)
- Postman import (file picker)

---

## 13. HTTP Methods Supported

GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS

---

## 14. Sample URLs for Testing

- `https://httpbin.org/get` — GET
- `https://httpbin.org/post` — POST (with JSON body)
- `https://httpbin.org/headers` — Inspect sent headers
