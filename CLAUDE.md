@AGENTS.md

## Project

Presentation index for MOOCO, served on a subdomain of the main site. It catalogs the
studio's slide decks and serves each one from its own URL, so a deck can be sent to a
client without duplicating a wrapper folder by hand. The slides stay in Google Slides —
this app never hosts their content, only the frame around it.

- `/` — index of all presentations: name, link to the deck's own page, link to the
  Google Slides editable, and tags for searching and filtering.
- `/new` — form to register a new presentation in the index.
- `/<slug>` — full-screen wrapper that plays the deck. This is the link sent to clients.

All presentation data lives in a database (Supabase, planned — not yet integrated); until
it is wired up, `lib/presentations.ts` backs the same interface with an in-memory store.
The index and the `/<slug>` pages are built from it.

## Stack

- **Next.js 16.3.4** (App Router, Turbopack) — NOTE: newer than training data; read
  `node_modules/next/dist/docs/` before writing framework code (see top of this file).
- **React 19.2** / **TypeScript 5** (strict)
- **Tailwind CSS 4** (via `@tailwindcss/postcss`)
- **Supabase** (planned) — database for presentation entries
- **Yarn 1 (classic)** — dependencies require Node `^20.19 || ^22.13 || >=24`; on
  Node 23 install with `yarn install --ignore-engines`
- ESLint 9 with `eslint-config-next`

## Repo map

- `app/` — App Router routes (`layout.tsx`, `page.tsx`, `globals.css`, `icon.png`,
  `[slug]/`, `new/`)
- `lib/` — data access plus pure helpers; the only place that talks to the database
- `docs/` — team workflow docs and the [backlog](docs/backlog/README.md)
- `reference/` — third-party implementations kept for reference only; excluded from
  ESLint and Tailwind, never imported or deployed
- Config at root: `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`,
  `postcss.config.mjs`

## Architecture rules

- Server Components by default; add `"use client"` only where interactivity requires it.
- Fetch presentation data in Server Components / route handlers. Keep all database
  access in one data-access module (`lib/`) — pages never talk to Supabase directly.
- The slug is the presentation's stable identity: generated once on creation, used as
  the route param and the database key.
- Store Google Slides identifiers, never URLs, and rebuild the URLs from them
  (`lib/google-slides.ts`). A deck has two unrelated ids: the published id (`2PACX-…`,
  valid only on `/pub` and `/pubembed`) and the file id (valid only on `/edit`). Neither
  derives from the other, so both are stored separately.
- The ids-only rule applies to decks. Assets (reels, files, anything not a Slides deck —
  [planned](docs/backlog/data-deck-and-asset-entries.md)) are the one exception: they
  store their external URLs as-is, validated server-side as `https:`.
- No secrets in client code. Supabase keys live in environment variables; anything
  exposed to the browser must be safe to be public.

## Code quality

- Apply standard good practices: clear names, single-responsibility functions, no duplicated logic, fail fast at boundaries.
- **Modularize when it adds clarity or enables reuse — not by default.** A second concrete use justifies extracting a module; a hypothetical third does not. Three similar lines beat a premature abstraction.
- Keep functions short enough to read at a glance. If a function needs section comments to navigate, split it.
- Prefer pure functions for data transformations; isolate side effects (I/O, network, host API calls) at the edges of each module.
- Validate at system boundaries (user input, external APIs, file reads). Trust internal calls — do not re-validate what an upstream module already guaranteed.

## Commit and release conventions

See [docs/commits-and-releases-workflow.md](docs/commits-and-releases-workflow.md). Summary:

- Conventional Commits: `feat` / `fix` / `refactor` / `docs` / `chore`
- SemVer driven by commit prefixes
- `feat!` or `BREAKING CHANGE:` for major bumps
- Never run `yarn release` from a feature branch

---

## How we work

- **Communicate with the user in Spanish.** All code, comments, identifiers, file content, and commit messages stay in English.
- **Confirm before destructive or shared-state actions** (force push, branch deletes, rewriting history, publishing). Local file edits and tests do not require confirmation.
- **Git workflow actions require explicit user authorization.** Never commit, create branches, open PRs, or merge on your own initiative — when the work is ready, propose the action (scope + message/name) and wait for the user's go-ahead. This applies to every instance, including docs/backlog hygiene commits.
- **Do not invent scope.** Stick to what was asked. Spotted issues outside scope: mention them, do not silently fix.
- **Out-of-scope improvements go to `docs/backlog/`.** When something worth doing surfaces but does not fit the current task (alternative algorithms, cross-host features, infrastructure changes, broader refactors, future security work), ask the user whether to add it to the [backlog](docs/backlog/README.md). Do not add silently and do not skip the question. One file per item under `docs/backlog/`, named `<category>-<slug>.md` (e.g. `render-output-module.md`). Each entry should describe **why** it matters, **when** to revisit, and any relevant **notes** / pointers. Update `docs/backlog/README.md` (the index) with a one-line hook for the new item. Done items get deleted — git keeps the history.
- **No premature abstractions.** If a module is used once, do not generalize it. Wait for the second use.
- **No dead code, no TODO comments, no commented-out blocks.** If it is not needed, delete it.
- **No comments explaining what the code does.** Only write a comment when the _why_ is non-obvious (a constraint, a workaround, a subtle invariant).
- **Verify before claiming success.** For UI changes, exercise the feature in the panel before reporting done. Type-check passing is not feature-correct.
- **Plan documents go in conversation, not in files.** Do not create `PLAN.md`, `NOTES.md`, or similar unless explicitly requested.
