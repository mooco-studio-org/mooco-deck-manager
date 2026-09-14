# Commits and Release Workflow Guide

## Release Team Rule

To avoid conflicts in versions and tags, follow these rules:

- Never run `yarn release` from a feature branch.
- Only run `yarn release` from the `main` branch.
- Only one person runs the release after merge.

---

## Commit Message Convention

To ensure the changelog is generated correctly, commits must follow a specific format.

### Prefix meanings

1. **feat**: new functionality (triggers a minor version bump)
2. **fix**: bug fix (triggers a patch version bump)
3. **refactor**: internal changes without modifying behavior
4. **docs**: documentation changes
5. **chore**: maintenance, tooling, or configuration changes

---

## Documented Examples

```bash
feat: add text layer processing by name
fix: handle empty text layers without crashing
refactor: split figma utils into separate modules
docs: update setup instructions for plugin development
chore: update dependencies and clean unused files
feat(parser): support nested text nodes
```

---

## Important

If a commit does not follow this convention:

- It will NOT be included automatically in the CHANGELOG
- It will NOT be considered for version calculation

This does not break the system, but it makes the change history less clear.

### Example of a non-versioned commit

`update stuff`

---

## Versioning Rules (SemVer)

Versioning is fully driven by commit types:

- **fix** → patch (1.0.4 → 1.0.5)
- **feat** → minor (1.0.4 → 1.1.0)
- **BREAKING CHANGE** → major (1.1.0 → 2.0.0)

---

## Breaking Changes (Major Version)

A breaking change triggers a major version bump (e.g. 2.0.0).

### How to declare a breaking change

Option 1 (explicit):

feat: redesign export system

BREAKING CHANGE: export format is no longer compatible with previous versions

Option 2 (shortcut):

feat!: redesign export system

---

## What is considered a breaking change

A breaking change is any change that alters existing behavior in a way that breaks current usage.

Examples:

- Changing export formats
- Renaming or removing configuration keys
- Changing how Airtable data is structured or consumed
- Modifying how the plugin detects project information
- Removing or altering existing features

---

## What is NOT considered a breaking change

- Internal refactors
- Performance improvements
- UI changes that do not affect workflow
- Build or release process changes

---

## Team Guidelines

- Use `feat` only for user-facing changes
- Use `chore` for tooling and release-related changes
- Use `refactor` for internal code improvements
- Use `!` or `BREAKING CHANGE` only when behavior changes in a way that breaks usage
