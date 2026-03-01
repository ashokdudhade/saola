# Saola UX Agent Guidelines

This document guides UX decisions: color themes, icon vs text, usability, and visual consistency. Use it when changing the UI.

---

## 1. Color Themes

### Design System (Current)
- **Palette:** Deep void dark (#030303) with emerald accent (#10b981)
- **Variables:** Use CSS variables from `index.css` — never hardcode hex/rgb in components
- **Hierarchy:** `--bg-void` (deepest) → `--bg-primary` → `--bg-secondary` → `--bg-elevated` → `--bg-hover`

### Theme Change Rules
1. **Light/dark toggle:** Prefer a single theme mode for v1; avoid toggling unless explicitly requested
2. **Accent color:** Change `--accent`, `--accent-hover`, `--accent-muted` together for consistency
3. **Contrast:** Maintain WCAG AA for text on backgrounds (`--text-primary` on `--bg-elevated` ≥ 4.5:1)
4. **Status semantics:** Keep HTTP status colors — green (2xx), blue (3xx), orange (4xx), red (5xx)

### Adding New Themes
- Define a `[data-theme="name"]` block in `index.css`
- Override only the variables that differ
- Test both light and dark surfaces for legibility

---

## 2. Icon vs Text

### Use Icons When
- **Universal actions:** Send (▶), Save (💾), Settings (⚙), Close (×)
- **Space-constrained areas:** Tab close button, toolbar, header
- **Repeated patterns:** HTTP method badges (GET, POST) — keep text; status indicators can be icon + color
- **Recognition > discovery:** Users already know the action (e.g. Play for Send)

### Use Text When
- **Primary actions:** "Save", "Save as", "New Request" — clarity trumps compactness
- **First-time or rare actions:** "Create collection", "Import Postman"
- **Contextual labels:** Params/Headers/Body tabs — text is clearer than icons
- **Ambiguous actions:** If an icon could mean multiple things, use text or icon + tooltip

### Hybrid
- **Icon + tooltip:** Good for secondary actions (settings gear, sidebar toggle)
- **Icon + text:** Use for prominent CTAs when space allows (e.g. "Send" with ▶)
- **aria-label:** Always add for icon-only buttons for accessibility

### Saola Conventions
| Element            | Current choice | Reason                    |
|--------------------|----------------|---------------------------|
| Sidebar toggle     | Text (☰ / ✕)   | Clear state indication    |
| Settings           | Icon (gear)    | Universal, compact        |
| Send button        | Text + kbd     | Primary action, discoverable |
| Tab close          | Icon (×)       | Compact, familiar         |
| New tab            | Icon (+)       | Universal, minimal space  |
| Collection + New   | Text "New" / + | Empty state needs text    |

---

## 3. Usability

### Interaction
- **Feedback:** Every clickable element must show hover/focus state
- **Loading:** Show loading indicator for async actions (e.g. Send, Save)
- **Errors:** Inline or toast — avoid blocking modals for non-critical errors
- **Confirmations:** Use `confirm()` sparingly; prefer reversible actions

### Layout
- **Density:** API clients are used for long sessions — avoid cramping; use comfortable padding
- **Scannability:** Group related controls (method + URL + Send); separate response area clearly
- **Responsiveness:** Min width ~800px; sidebar collapsible for smaller windows

### Forms
- **Labels:** Visible labels for inputs; placeholders supplement, not replace
- **Validation:** Validate on blur or submit; don’t block typing
- **Defaults:** Sensible defaults (e.g. GET, httpbin.org) to reduce friction

### Keyboard
- **Shortcuts:** Expose in tooltips or a shortcut palette (Cmd+P)
- **Focus:** Logical tab order; focus trap in modals; Escape to close

---

## 4. Consistency Checklist

- [ ] Use `var(--*)` tokens, not raw colors
- [ ] Use `--radius-sm/md/lg` for borders, not arbitrary values
- [ ] Use `--transition-fast` / `--transition-base` for animations
- [ ] Match existing patterns (e.g. `.save-btn` style for primary actions)
- [ ] Check hover/focus/disabled states
- [ ] Ensure contrast on all text

---

## 5. Quick Reference

### Token Naming
- `--bg-*` — backgrounds (void, primary, secondary, elevated, hover)
- `--border-*` — borders (subtle, default)
- `--text-*` — text (primary, secondary, muted)
- `--accent*` — primary accent (accent, accent-hover, accent-muted)
- `--status-*` — HTTP status (success, redirect, client-error, server-error)
- `--radius-*` — border radius (sm, md, lg)

### Fonts
- **UI:** `var(--font-display)` — Outfit
- **Code/URL/params:** `var(--font-mono)` — JetBrains Mono
