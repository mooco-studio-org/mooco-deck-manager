# Backlog

Items deliberately deferred. One file per item — each with **Why** / **When** / **Notes**.

New entries land here only after asking the user (see the corresponding rule in [../../CLAUDE.md](../../CLAUDE.md)). Done items get deleted — git keeps the history.

## Index

- [Deploy to Vercel on the MOOCO subdomain](infra-deploy-vercel-subdomain.md) — blocked on auth; do not publish the index before it is protected.
- [Per-client access to individual presentations](data-per-client-presentation-access.md) — sharing one deck with one client, beyond the `internal` / `public` split.
- [Edit and delete presentations](feature-edit-delete-presentations.md) — the MVP only creates and reads; fixing an entry means touching the database by hand.
- [Admin panel for entries and categories](feature-admin-panel.md) — edit the catalog from the app instead of Supabase's Table Editor, with the app's validation.
- [Evaluate enabling Cache Components](framework-evaluate-cache-components.md) — off by default in Next 16.3.4, but where the framework is heading.
- [Install the release tooling the workflow doc assumes](infra-release-tooling.md) — `yarn release` is documented but the script does not exist.
- [Adapt the commit workflow examples to this project](docs-adapt-commits-workflow-examples.md) — the breaking-change examples describe a different repo.
- [Set up a test runner](infra-testing-setup.md) — nothing is tested; slug generation is the first thing that should be.
- [Keep form values when a submission fails](feature-keep-form-values-on-error.md) — a validation error clears every field in `/new`.
- [Stop `/favicon.ico` from querying the database](feature-favicon-hits-deck-route.md) — it falls through to `/<slug>` on every page load.

### Port of the reference index

Ordered by dependency; the migration comes last.

- [Upload a thumbnail for each presentation](feature-thumbnail-upload.md) — image upload in `/new`, stored in Supabase Storage.
- [Migrate the reference index into the database](data-migrate-reference-index.md) — URLs to Slides ids; published ids are not in the data and must be recovered.
