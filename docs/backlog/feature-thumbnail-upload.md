# Upload a thumbnail for each presentation

Let the `/new` form take an image that becomes the presentation's thumbnail on the index.

## Why

The reference index (`reference/vanilla-deck-manager/`) shows a thumbnail on every deck
card, and it is the fastest way to recognise a deck in a grid of similar titles. This app
only shows text.

## When

Before [migrating the reference index](data-migrate-reference-index.md), which brings 43
existing thumbnails.

## Notes

- `description` already exists in the model and the `/new` form; only the image is new.
- Storage: Supabase Storage is the natural fit; store the object path in the row, not a
  full URL, consistent with how Slides ids are stored.
- The upload is a system boundary: validate type and size server-side in the Server Action,
  not only with `accept=` on the input.
- The reference normalises to WebP, 800 px wide, quality 75, rendered with
  `object-fit: cover; object-position: top center` in a 16:10 frame (`ARCHITECTURE.md` §9).
  Decide whether to convert on upload or serve through `next/image`.
- The card already has the slot: `Thumbnail` in `app/_components/entry-card.tsx` renders
  a gradient plus the first letter in a 16:10 frame. The image goes on top of it, so an
  entry without one (or with a broken one) still shows the placeholder.
- Replacing or removing the image belongs with
  [edit and delete](feature-edit-delete-presentations.md).
