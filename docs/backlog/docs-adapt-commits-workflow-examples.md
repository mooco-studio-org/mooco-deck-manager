# Adapt the commit workflow examples to this project

The breaking-change examples in `docs/commits-and-releases-workflow.md` describe a
different codebase.

## Why

The doc illustrates what counts as a breaking change with cases like "changing how Airtable
data is structured or consumed" and "modifying how the plugin detects project information".
This project has no Airtable and is not a plugin — the examples come from a sibling MOOCO
repo. Examples that do not match the project teach the wrong instinct about when to bump a
major version.

## When

Low priority, and cheap. Good to fold into any other documentation pass rather than doing
on its own.

## Notes

- Replace with examples grounded here: changing the shape of a presentation record,
  changing how slugs are generated (which would invalidate existing URLs), or changing the
  visibility model.
- The rest of the doc — prefixes, SemVer mapping, the rule against releasing from a feature
  branch — is accurate and should stay.
- Related: [infra-release-tooling.md](infra-release-tooling.md).
