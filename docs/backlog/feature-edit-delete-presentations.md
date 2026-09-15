# Edit and delete presentations

Add the ability to change an existing entry and to remove one from the index.

## Why

The MVP only creates and reads. Links rot, decks get renamed, and test entries need
removing — without edit and delete, fixing any of that means going into the database by
hand.

## When

Shortly after the MVP is in real use. It is deferred only to keep the first milestone
small, not because it is optional.

## Notes

- The slug is the stable identity and must **not** change on edit, even when the title
  does. This is an architecture rule in `CLAUDE.md`, and changing it would break every
  shared link.
- Every mutation needs its authorisation check inside the Server Action itself. Server
  Actions are POST endpoints reachable directly, so guarding the page is not enough.
- Prefer a soft delete if entries are ever referenced from outside this app; decide when
  picking it up.
- Revalidate with `updateTag` before any `redirect` — `redirect` throws a control-flow
  exception, so nothing after it runs.
