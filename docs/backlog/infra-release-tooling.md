# Install the release tooling the workflow doc assumes

`docs/commits-and-releases-workflow.md` tells the team to run `yarn release`, but no such
script exists and no versioning tool is installed.

## Why

The documented process cannot be followed as written. Anyone who reads the workflow doc and
tries to cut a release hits a missing script. Either the tooling arrives or the doc is
wrong — the gap should not sit there indefinitely.

## When

Before the first real release. There is no urgency while the project is pre-MVP and nothing
is being versioned.

## Notes

- `package.json` has no `release` script and no `standard-version` / `semantic-release`
  dependency. The version is still `0.1.0`.
- The workflow doc already specifies the intended behaviour: SemVer driven by Conventional
  Commit prefixes, a CHANGELOG, `feat!` / `BREAKING CHANGE:` for major bumps, and releases
  only from `main`. Whatever tool is chosen has to honour that.
- Related: [docs-adapt-commits-workflow-examples.md](docs-adapt-commits-workflow-examples.md).
