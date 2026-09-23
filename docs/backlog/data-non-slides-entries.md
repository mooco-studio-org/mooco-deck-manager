# Entries that are not Google Slides decks

Decide how the index handles entries that are videos or external links rather than
Google Slides presentations.

## Why

The model assumes every entry is a Slides deck (`publishedId` is required). The reference
index (`reference/vanilla-deck-manager/`) also lists reels and other material: 4 entries
point to `drive.google.com/file/d/…` (videos), one to `shots.re`, and several have no
public URL at all. They cannot be migrated as-is.

## When

Before [migrating the reference index](data-migrate-reference-index.md).

## Notes

- Options: keep them out of this app; add a `kind` field (`slides` / `video` / `link`)
  with its own ids and its own `/<slug>` rendering; or store an external URL for non-Slides
  kinds only.
- A `kind` field would bend the "store ids, not URLs" rule for arbitrary links — decide
  explicitly rather than by accident.
- Drive video files have a file id and an embeddable `/preview` URL, so they could fit the
  ids-only approach.
