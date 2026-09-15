# MOOCO Deck Manager

Presentation index for MOOCO, served on a subdomain of the main site. It catalogs the
studio's slide decks and links out to them — it does not host the slides themselves.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Index of all presentations: name, live link, Google Slides editable, and tags |
| `/new` | Form to register a new presentation |
| `/<slug>` | Detail page for one indexed presentation |

## Getting started

Dependencies require Node `^20.19 || ^22.13 || >=24`. On Node 23, install with
`yarn install --ignore-engines`.

```bash
yarn install
yarn dev
```

The app runs at http://localhost:3000.

## Checks

```bash
npx tsc --noEmit && yarn lint
```

## Documentation

- [CLAUDE.md](CLAUDE.md) — project spec, architecture rules, and working conventions
- [docs/commits-and-releases-workflow.md](docs/commits-and-releases-workflow.md) — commit and release conventions
- [docs/backlog/](docs/backlog/README.md) — deferred work
