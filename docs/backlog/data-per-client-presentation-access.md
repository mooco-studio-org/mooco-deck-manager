# Per-client access to individual presentations

Let a specific presentation be shared with named external people or client organisations,
beyond the binary `internal` / `public` split the MVP ships with.

## Why

Some decks are made for a single client. Today the only options are "anyone with the link"
or "MOOCO team only". Neither fits a deck that should be visible to one client and nobody
else outside the studio.

## When

Once the MVP is in daily use and there is a concrete client case driving the requirement.
Building it earlier means guessing at a permission model without a real example.

## Notes

- The MVP's `visibility` field is a string union (`"internal" | "public"`), chosen so a
  third value can be added without a destructive migration.
- The hard part is not the field, it is the identity: external clients do not have MOOCO
  Google accounts. Options worth comparing when this is picked up — magic links, per-deck
  share tokens, or inviting clients as Supabase users.
- Whatever the mechanism, the authorisation check belongs in the Supabase RLS policies as
  well as in `lib/presentations.ts`. The app layer alone is not a security boundary.
- Related: [feature-edit-delete-presentations.md](feature-edit-delete-presentations.md) —
  changing a deck's visibility is an edit operation.
