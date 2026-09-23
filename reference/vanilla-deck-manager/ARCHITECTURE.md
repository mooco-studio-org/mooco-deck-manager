# MOOCO Links Index — Architecture & Runtime

## 1. Purpose

Internal, single-page directory of MOOCO's presentations, reels, and client decks. Built as a self-modifying Claude Artifact: the browser page itself edits and republishes its own source when users add, edit, or delete entries. No external database, no build step.

## 2. Repository Layout

```
/Users/carlos/Desktop/Folders/MOOCO/MOOCO Index/
├── mooco-links.html           # complete SPA (HTML + inline CSS + inline JS + embedded JSON data)
├── thumbs/
│   ├── *.webp                 # published deck thumbnails (39 files, ~600 KB total)
│   └── originals/             # source PNGs (not published; kept for reprocessing)
├── ARCHITECTURE.md            # this file
├── mooco-index-biblioteca.md  # human-authored tag/description reference
└── Links Index - *.xlsx       # source spreadsheets (imported into JSON on demand)
```

The published artifact contains only `mooco-links.html` and `thumbs/*.webp`.

Published at: `https://claude.ai/artifact/YE5Wb88n6uMy9wF6i3XW5M`.

## 3. Tech Stack

| Layer      | Choice                                                                         |
| ---------- | ------------------------------------------------------------------------------ |
| Rendering  | Vanilla JS, no framework. Template strings + delegated event handlers.         |
| Styling    | Inline `<style>` block. CSS custom properties. Onest via Google Fonts.         |
| State      | In-memory JS object, embedded on-page as JSON. localStorage fallback.          |
| Persistence| Claude Artifact runtime `claude.use("artifact").publish(html)` (see §7).       |
| Assets     | WebP images published as artifact files, referenced by relative path.          |
| Build      | None. The `.html` file is the single deployable unit.                          |

## 4. Data Model

The full application state is a single JSON object serialized into `<script id="links-data" type="application/json">` at the top of the HTML. Shape:

```jsonc
{
  "activeSheet": "evergreen",         // legacy field; only "evergreen" is used
  "sheets": {
    "evergreen": {
      "label": "Evergreen",
      "categories": [
        {
          "name": "Capabilities",
          "groupHeader": "Portfolio",  // optional; renders an eyebrow label above the category
          "links": [
            {
              "name": "Capabilities",
              "url": "https://mooco.studio/Capabilities/",     // Visit URL (public page)
              "editableUrl": "https://docs.google.com/...",    // Editable URL (Google Slides/Drive)
              "description": "Deck general de las soluciones...",
              "tags": ["Solutions", "Servicios", "Capabilities", "Overview", "Pitch"],
              "thumb": "capabilities.webp"                     // filename relative to thumbs/
            }
          ]
        }
      ]
    }
  }
}
```

### Field semantics

- `url` — Visit target; opens in new tab. If empty/invalid, Visit button renders muted (opens editor on click).
- `editableUrl` — editable version (typically Google Slides). If empty, "Editable" pill renders as a dashed disabled state with a slashed-circle icon.
- `tags` — searchable strings, hidden from UI. Whole-word match at search time.
- `description` — optional subtitle in card body (3-line clamp).
- `thumb` — filename inside `thumbs/`. If absent, a deterministic gradient + first-letter placeholder is rendered.
- `groupHeader` — only present on the FIRST category of a group; renders as an uppercase eyebrow above that section.

### Current top-level shape (as of last publish)

```
Portfolio group:
  Capabilities        (6 links)
  Craft               (5 links)
  Special Decks       (8 links)
  Brand's Works       (4 links)
Propuestas para Clientes group:
  Propuestas Comerciales  (8 links)
  Propuestas Creativas    (8 links)
Ungrouped:
  Reels               (4 links)
```

Total ≈ 43 links, ~39 with thumbnails.

## 5. UI Architecture

Single scroll. Three fixed regions:

1. **Sticky header** — logo (inline SVG), meta counter, save-state pill, search input, "Add Link" button.
2. **Category grid** — 3-column responsive grid of category cards. Click selects a category (or search overrides it).
3. **Deck grid** — 3-column grid of deck cards for the selected category, or search matches across all categories.

### Category card

- Light-grey rounded card; selected state = full black.
- Displays `groupHeader` (top-left eyebrow), link count (top-right pill), category `name` (large bold at bottom).

### Deck card

- Dark card with 16:10 thumbnail on top, body below.
- Thumbnail layers (z-index, back → front): gradient background, hidden letter placeholder, `<img>` (WebP), "◆ MOOCO" brand watermark.
- Body: category eyebrow, title, description (`-webkit-line-clamp: 3`), action row:
  - `Visit ↗` — yellow bg (`--accent`) if valid URL, muted outline if empty.
  - `Editable ↗` — outline if URL present, dashed with slashed-circle icon if empty.
  - Edit icon (pencil) → opens modal.
  - Delete icon (trash) → confirm + splice.

## 6. State Management

```
Module-scoped variables (IIFE):
  state          — parsed JSON.
  selectedCat    — string; category name currently shown (defaults to first).
  searchTerm     — current search query.
  saveTimer      — debounce handle for persistence.
  claudeArtifact — resolved artifact capability, or null.
  artifactAsked  — one-shot latch for resolution.
```

Render pipeline is monolithic — every state change calls `renderAll()`, which reruns:

1. `renderHeaderMeta()` — updates `<N> decks · <N> categorías` in the header.
2. `renderCategoryCards()` — rebuilds the category grid HTML string, attaches click handlers.
3. `renderDeckCards()` — computes the deck list (search results vs. selected category), rebuilds cards HTML, wires per-card handlers.

No virtual DOM. `innerHTML` is set from template strings. Wiring is re-attached each render (acceptable at this scale — ≤50 links).

## 7. Persistence & Sync

The page uses the `capabilities: { artifact: {} }` runtime capability. On any mutation (add/edit/delete):

1. `save()` schedules `doSave()` after a 600 ms debounce.
2. `doSave()`:
   - Attempts `localStorage.setItem("mooco-links", JSON.stringify(state))` as a fallback.
   - Awaits `window.claude.use("artifact")`. If null → sets save state to "Guardado local" and returns.
   - Fetches the current page source: `await fetch(location.href, { cache: 'no-store' })`.
   - Replaces the entire `<script id="links-data">…</script>` block with the new JSON.
   - Publishes: `await claudeArtifact.publish(newSrc)`.
3. On success → the artifact host live-reloads all open views to the new version.

Error codes handled explicitly:

- `conflict` → another writer published first; the shell already reloads.
- `not_writer` / `not_granted` / `not_declared` → viewer is read-only; save state → "Solo lectura".

Consideration: the `</script>` closing tag inside JS string literals is escaped as `<\/script>` to avoid HTML parser premature termination.

## 8. Search Behavior

Search is applied in `renderDeckCards()` when `searchTerm.trim()` is non-empty. Match logic per link:

- **Substring, case-insensitive** against: `name`, `url`, `editableUrl`, `description`.
- **Whole-word match** against tags: `new RegExp('\\b' + escapedQuery + '\\b', 'i').test(tag)`.

The whole-word rule for tags exists so that short tokens like `IA` do not falsely match Spanish words containing "ia" (e.g., "Radiografias", "Tutoriales"). Substring matching is preserved for name/description because users expect "Para" to find "Paramount".

When a search term is set:

- Category cards render without a selection highlight.
- Result grid combines matches from every category.
- Header shows `Resultados · N matches · "query"`.

## 9. Assets Pipeline

Thumbnails are 800 px wide WebP files at quality 75, method 6, `object-fit: cover; object-position: top center;` in the DOM.

Source PNGs live in `thumbs/originals/`. Conversion is done ad-hoc via Python + PIL:

```python
img = Image.open(src)
if img.width > 800:
    img = img.resize((800, int(img.height * ratio)), Image.LANCZOS)
img.save(dst, "WEBP", quality=75, method=6)
```

Naming convention: each link name is slugified (ASCII fold, lowercase, non-word→hyphen, ≤60 chars) and the result is the filename. Example: `"Paramount+ - Figma Pipeline"` → `paramount-figma-pipeline.webp`.

The slug is stored explicitly per-link in the `thumb` field to avoid runtime slugification drift between Python and JS.

## 10. Categorization & Grouping

Two levels:

- **Group** — visual eyebrow only. Set via `groupHeader` on the first category of each group. Groups currently: "Portfolio", "Propuestas para Clientes". Reels is intentionally ungrouped (renders after Propuestas with no eyebrow).
- **Category** — the interactive unit. Categories act as filter buttons and section headers. There is no formal ID; matching is by `name`.

Reordering categories = editing the `categories` array order.

## 11. Editing Flow

The "Add Link" button and per-card pencil icon open the same modal (`openEditor({ catIdx, linkIdx })`). Fields:

- Name (required)
- Visit URL (optional)
- Editable URL (optional)
- Description (optional)
- Tags (comma-separated)
- Category dropdown (existing + "+ Nueva categoría…" input)

On submit:

1. Build the new link object.
2. If editing: splice out the old entry. If its parent category is now empty, splice the category too.
3. Locate the target category by name; create a new one if needed.
4. Push the link.
5. Set `selectedCat = catValue`, close modal, `renderAll()`, `save()`.

Delete uses `confirm(...)` and follows the same splice-and-save flow.

## 12. Publishing Workflow (offline)

When editing from outside the running page (e.g., re-importing from an updated xlsx):

1. Modify `mooco-links.html` locally with Python: parse the JSON block, mutate, serialize back with `re.sub` of the script block.
2. For new thumbnails, drop a PNG in `thumbs/originals/`, run conversion → `.webp` in `thumbs/`.
3. Publish via Artifact tool:
   - HTML-only change: pass `file_path` only.
   - Adding files: pass `files: { "thumbs/foo.webp": "/abs/path/thumbs/foo.webp" }`.
   - Replacing files not read this session: `overwrite_unread: ["thumbs/old.jpg", ...]`.
   - Removing files: `files: { "thumbs/old.jpg": null }`.

The artifact runtime enforces a compare-and-set on published version; if concurrent, the reject code is `conflict`.

## 13. Design Decisions & Constraints

- **Single file**: the app is one HTML file so the entire deployment surface fits in `artifact.publish()`. Splitting CSS/JS was rejected because the mutation cycle (fetch → mutate → publish) is easier with one canonical file.
- **JSON in-page**: allows the page to be its own database. On publish, we don't serialize the live DOM (which would leak runtime state), we swap only the JSON script block.
- **No framework**: total JS is ~800 lines. React/Svelte would add build overhead without benefit at this scale.
- **WebP everywhere**: ~65% smaller than the previous JPG bundle. All modern browsers on the Claude artifact viewer support WebP.
- **Hidden tags**: tags are searchable metadata but do not render on cards, per user requirement. This keeps the visual layer minimal without losing findability.
- **Special case — AI Studio**: the Visit URL is intentionally empty per user directive; xlsx re-imports must preserve this exception.

## 14. Extending

- **New category**: add `{ name, links: [] }` (optionally `groupHeader`) to `sheets.evergreen.categories`.
- **New group header**: strip old `groupHeader` from the previous holder; set on the first category of the new group.
- **New sheet/tab**: previously supported (years 2023-2025 were sheets). Currently only one sheet; the sheet nav auto-hides when there's ≤1. Adding another sheet key restores the tabs.
- **Extra runtime capability**: extend the `capabilities` argument to `Artifact` publish (e.g., `db`, `room`); load via `await claude.use("<name>")` in the IIFE. See Claude's artifact-capabilities skill for the current contract.
