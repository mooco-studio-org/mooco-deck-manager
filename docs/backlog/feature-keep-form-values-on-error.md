# Keep form values when a submission fails

When `/new` returns a validation error, every field the user typed is cleared, not just the
one that failed.

## Why

React resets a form after its action finishes, whatever the result. A typo in one link
means retyping the title, description, tags and the other link. It gets worse as the form
grows (categories, thumbnails).

## When

Before the form gains more fields — the [thumbnail upload](feature-thumbnail-upload.md) in
particular, since a file input cannot be refilled by the browser at all.

## Notes

- The type selector in `app/new/form.tsx` already works around the reset by tying its
  `defaultChecked` to state; the other fields have no such protection.
- Usual approach: return the submitted values in `FormState` alongside `errors` and feed
  them back as `defaultValue`s. Check the Next 16 forms guide
  (`node_modules/next/dist/docs/01-app/02-guides/forms.md`) for the current recommendation.
- File inputs cannot be restored; the thumbnail flow will need its own answer (e.g. upload
  first, keep the stored path in state).
