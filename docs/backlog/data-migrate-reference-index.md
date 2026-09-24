# Finish moving off the reference index

The catalog lives in the database now: 21 decks and 4 reels imported from the team's
`decks-sheet` Google Sheet, 21 of them with their thumbnail from the reference index
(`reference/vanilla-deck-manager/`). A few loose ends remain before the reference can go.

## Why

Links to the old wrapper folders on the main site have already been sent to clients, and
one deck is still missing. Until both are handled, the reference is the only record of
them.

## When

Before the old wrapper folders on the main site are taken down — that is when their links
start breaking.

## Notes

- **Old URL → slug map.** The reference `url` field holds the old wrapper folders
  (`https://mooco.studio/Capabilities/`, …). Matching reference entries to database rows by
  Google Slides file id (the reference's `editableUrl` through `extractFileId`, as the
  thumbnail import did) gives the map a redirect on the main site would need. The
  redirect itself is a main-site change.
- **Sony** (Brand's Works) is not in the catalog: the sheet has no published link for it.
  Add it from `/new` once it is published in Google Slides.
- **Four entries have no thumbnail**: Disney DCP and AB2 Commit to the Bitt (no editor
  link to match on), IA Studio and IA Reel (their files differ from the reference's). The
  reference has name-alike thumbnails (`disney-dcp.webp`,
  `ab2-commit-to-the-bitt-ideas-proposal.webp`, `ai-studio.webp`, `ia-reel.webp`); they
  can be uploaded from the [admin panel](feature-admin-panel.md) once it exists.
- Descriptions and tags are not migrated from the reference: the team will write them in
  the admin panel.
- Once the map exists, decide whether `reference/` still earns its place in the repo.
