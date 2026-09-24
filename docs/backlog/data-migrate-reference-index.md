# Enrich the imported catalog from the reference index

The catalog is already in the database — 21 decks and 4 reels, imported from the team's
`decks-sheet` Google Sheet. What the sheet did not carry is still in the reference index
(`reference/vanilla-deck-manager/mooco-links.html`): descriptions, search tags,
thumbnails, and the old wrapper URLs.

## Why

Without tags, search only matches titles; without descriptions and thumbnails, every card
shows "Sin descripción todavía." over a placeholder. The reference has 26 descriptions,
tags on 42 of its 43 entries and a WebP thumbnail for all of them.

## When

Descriptions and tags: any time — the columns already exist. Thumbnails: after
[thumbnail upload](feature-thumbnail-upload.md) settles where images live.

## Notes

- Source is the JSON block `<script id="links-data">` in `mooco-links.html`
  (`sheets.evergreen.categories[].links[]`); shape in its `ARCHITECTURE.md` §4.
- Match reference entries to database rows by Google Slides file id (the reference's
  `editableUrl`, through `extractFileId` in `lib/google-slides.ts`), not by title: the
  imported titles were cleaned up and no longer match the reference names. Reels match by
  the Drive file id in their URL.
- The reference has more entries than the sheet (43 vs 25). The sheet is the list the team
  chose, so unmatched reference entries are skipped.
- Tags: the app stores them lowercased (`parseTags` in `app/new/actions.ts`); normalise the
  same way.
- Thumbnails live in `reference/vanilla-deck-manager/thumbs/*.webp`, named in each
  reference entry's `thumb` field.
- The reference `url` field holds the old wrapper folders on the main site
  (`https://mooco.studio/Capabilities/`, …), which have already been sent to clients. The
  same file-id match gives an old-URL → slug map, which is what a redirect on the main site
  would need. Worth producing even if the redirect itself happens elsewhere.
- Still missing from the catalog: **Sony** (Brand's Works) — it has no published link yet.
  Add it from `/new` once it is published in Google Slides.
- Once this is done, decide whether `reference/` still earns its place in the repo.
