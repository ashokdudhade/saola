# Saola: Secure & Private API Development Platform

## 1. Project Overview
**Saola** is a high-performance, cross-platform desktop API client for macOS and Windows. Named after the rare and elusive "Asian Unicorn," Saola focuses on **privacy, speed, and user-owned data**. 

Unlike competitors that force data into their own clouds, Saola ensures your API collections and sensitive environment variables live exclusively in your own infrastructure (**Google Drive** or **AWS S3**), with local **End-to-End Encryption (E2EE)**.

---

## 2. System Architecture & Tech Stack
* **Framework:** Tauri (Recommended for performance/security) or Electron.
* **Language:** Rust (Backend/System logic) + React/TypeScript (UI).
* **Storage Bridge:** Decoupled adapter pattern for **Google Drive API** and **AWS SDK**.
* **Security:** AES-256-GCM encryption for all sensitive fields before synchronization.
* **Local State:** SQLite or IndexedDB for instant-access caching.

---

## 3. Detailed Requirements

### Functional Requirements
* **Request Engine:** Support for HTTP/1.1, HTTP/2, gRPC, and WebSockets.
* **Collection Management:** Create, nest, and tag collections using Postman-exact terminology.
* **Environment Variables:** Support for `{{variable}}` syntax across Params, Headers, and Body.
* **Scripting:** Pre-request and Post-response (Test) scripts with a sandboxed JS runtime.
* **Data Sovereignty:**
    * **Google Drive:** Sync via the `appDataFolder` for privacy.
    * **AWS S3:** Sync via user-provided S3 buckets and IAM credentials.

### Security Requirements
* **Local-First Encryption:** All data is encrypted with a user-defined Master Password before being sent to the Cloud Provider.
* **Zero-Knowledge:** Saola (the application) never sees your plain-text collection data on a remote server.
* **System Keychain:** Integration with macOS Keychain or Windows Credential Manager for Cloud API Tokens.

---

## 4. Implementation Phases

### Phase 1: The Core "Runner" (Local-First)
* [x] Setup project scaffolding (Tauri + Vite + TS).
* [x] Build the **Sidebar** (Collections tree) and **Request Tabs**.
* [x] Implement the **Request Builder** (Params, Auth, Headers, Body).
* [x] Integrate a monospaced code editor (Monaco or CodeMirror).

### Phase 2: The Storage Bridge
* [x] Implement **Google Drive Auth** flow (OAuth2) — UI placeholder, OAuth pending config.
* [x] Implement **AWS S3 Client** (Access Key/Secret) — configure_s3 command.
* [x] Build a **Sync Engine** that monitors local changes and pushes/pulls from the cloud provider — sync_push/sync_pull stubs.

### Phase 3: Encryption & Privacy
* [x] Develop the **E2EE Layer** using the Web Crypto API or Rust `aes-gcm` crate.
* [x] Implement the **Master Password** workflow for encrypting/decrypting collection exports.

### Phase 4: Collaboration & Advanced UX
* [x] Conflict resolution UI (Visual Diffing for shared collections) — ConflictResolution component.
* [x] Global Search (`Cmd/Ctrl + P`) for requests and variables.
* [x] Import/Export support for Postman v2.1 collections.

### Phase 5: Collection & Folder Management ✅ *Complete*

**Goal:** Enable users to create, organize, and persist API collections and folders. Wire `get_collections` to real storage instead of mock data.

**Summary:** Local JSON persistence → 5 new Tauri commands (create_collection, create_folder, save_request, rename_item, delete_item) → Sidebar context menus + Save (Cmd+S) + empty state. Import Postman merges into storage. Reorder/drag-drop can be deferred.

#### A. Persistence Layer
* [x] **Local storage for collections** — Store collections as JSON in app data dir (e.g. `~/.local/share/saola/collections.json` or `%APPDATA%/saola/collections.json`). Fallback: empty array if no file exists.
* [x] **Wire `get_collections`** — Read from local storage instead of hardcoded data.
* [x] **Integrate `import_postman`** — Merge imported collections into local storage (append or replace by user choice).

#### B. Rust Commands (Tauri)
| Command | Purpose |
|---------|---------|
| `create_collection` | Create a new top-level collection (name, id). |
| `create_folder` | Create folder inside a collection or inside another folder (parent_id, name, id). |
| `save_request` | Add or update a request at a target (collection_id or folder_id). Includes full request payload (method, url, params, headers, body). |
| `rename_item` | Rename collection, folder, or request by id. |
| `delete_item` | Delete collection, folder, or request by id. (Delete folder = delete its children.) |
| `reorder_items` | *(Optional)* Move item to new index or parent. Can defer to later phase. |

#### C. UI Changes

**Sidebar**
* [x] **"New Collection"** — "+ New" button in header, "Create collection" in empty state, right-click context menu (on sidebar or collection). Uses official `isTauri` detection; `withGlobalTauri: true` in config.
* [x] **Context menu (right-click)** on collection: *New Folder*, *New Request*, *Rename*, *Delete*.
* [x] **Context menu** on folder: *New Folder*, *New Request*, *Rename*, *Delete*.
* [x] **Context menu** on request: *Rename*, *Delete*, *Duplicate*.
* [x] **Empty state** — When no collections: show "No collections yet" and a prominent "Create collection" CTA.

**Request Builder / Tabs**
* [x] **"Save" / Cmd+S** — If current tab has no linked request: show "Save to collection" modal (choose collection/folder, optionally name). If linked: save in place. Call `save_request`.
* [x] **"Save as"** — Save current request as a new request in chosen location (duplicate with new id).
* [x] **Link tab to request** — When selecting a request from sidebar, tab is "linked" to that request id. Save updates that request.

#### D. Data Model Notes
* **IDs** — Generate UUIDs (or `col-{uuid}`, `fld-{uuid}`, `req-{uuid}`) for new items. Ensure uniqueness.
* **Request payload** — `save_request` must accept full request: `method`, `url`, `params`, `headers`, `body`. The current `CollectionItem::Request` has `id`, `name`, `method`, `url` only; extend to include `params`, `headers`, `body` for persistence (or store minimal and merge with defaults when loading).
* **Nesting** — Folders can contain folders (recursive). Collections contain folders and/or requests at top level.

#### E. Sync Integration (Future)
* Phase 5 focuses on **local persistence only**. When `sync_push`/`sync_pull` are implemented, they will read/write the same collections JSON. No changes to Phase 5 commands needed for initial sync integration.

#### F. Keyboard & UX
* `Cmd+S` — Save current request to collection.
* `Cmd+Shift+N` — *(Optional)* New collection quick-create.
* Right-click — Context menu on all sidebar items.
* Inline rename — *(Optional)* Double-click to rename; can use modal for v1.

---

### Phase 6: Environments & Variables ✅ *Complete*

**Goal:** Support `{{variable}}` syntax across Params, Headers, and Body. Local environment management.

| Task | Status |
|------|--------|
| Environment model (id, name, variables) | [x] |
| Rust: get_environments, create/update/delete, set_active | [x] |
| UI: Environment selector in settings panel | [x] |
| Variable interpolation in send_request | [x] |
| Add/Edit/Delete variables in env | [x] |

---

### Phase 7: Sync & Privacy UX ✅ *Complete*

| Task | Status |
|------|--------|
| Wire sync_push/sync_pull to collections JSON | [x] |
| Privacy indicator (sync destination status) | [x] |
| Export collections (JSON download) | [x] |

---

### Phase 8: Sidebar Visual Hierarchy

**Goal:** Improve sidebar display so collections, folders, and requests read as a clear hierarchy and feel like they belong together (Postman/Insomnia-style tree).

| Task | Status |
|------|--------|
| Indentation for hierarchy | [x] |
| Connector lines (tree lines) between parent and children | [x] |
| Visual distinction: collection vs folder vs request (icons or styling) | [x] |
| Consistent padding/depth per level (e.g. 12–16px per indent) | [x] |
| Expand/collapse for collections and folders | [x] |
| Hover states that reinforce grouping | [x] |

**Notes:**
* Use `paddingLeft` or `marginLeft` based on `depth` for indentation.
* Consider folder/request icons (▸ for collapsed, ▾ for expanded; document for request).
* Tree connectors (vertical/horizontal lines) clarify parent-child; optional but improves scannability.
* Per `agent-ux.md`: use design tokens, maintain contrast, follow icon-vs-text guidelines.

---

### Phase 9: Request Call Logs (Verbose View) ✅ *Complete*

**Goal:** Provide a way to view logs for each request call, with a verbose view of both the outgoing request and the incoming response (similar to Postman Console / browser DevTools Network).

| Task | Status |
|------|--------|
| Store per-call logs (request id, timestamp, request + response data) | [x] |
| UI: Log viewer/console panel (dockable or bottom drawer) | [x] |
| Verbose request view: method, full URL, headers, body, timing | [x] |
| Verbose response view: status, headers, body, size, duration | [x] |
| List of recent calls (chronological) with filter by request | [x] |
| Expand/collapse or tabs for Request vs Response sections | [x] |
| Copy to clipboard for request/response raw data | [x] |
| *(Optional)* Persist logs to disk (ring buffer) for session recall | [ ] |

**Notes:**
* Captured on each `send_request`: pre-send snapshot (method, resolved URL after interpolation, final headers, body) + post-response (status, headers, body, elapsed ms).
* Use virtualization for long log lists; truncate or lazy-load very large bodies.
* Per Developer UX Guidelines: color status codes (200=green, 4xx=orange, 5xx=red).

---

## 5. Developer UX Guidelines
* **Zero Latency:** UI must remain responsive during large API response rendering. Use virtualization for long JSON bodies.
* **Keyboard-Centric:** `Cmd+Enter` to send, `Cmd+S` to save to cloud, `Cmd+\` to toggle sidebar.
* **Visual Hierarchy:**
    * **Success (200s):** Green
    * **Redirect (300s):** Blue
    * **Client Error (400s):** Orange
    * **Server Error (500s):** Red
* **Privacy Indicator:** A persistent status icon showing the current sync destination (e.g., "S3 Protected" or "G-Drive Locked").

---

## 6. Postman Terminology Mapping
| Postman Term | Saola Term (Exact Match) |
| :--- | :--- |
| Collection | Collection |
| Environment | Environment |
| Workspace | Workspace |
| Pre-request Script | Pre-request Script |
| Tests | Tests |
| Global Variables | Globals |