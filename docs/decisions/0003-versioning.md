# 0003 — Versioning: lockstep, tag-driven SemVer

- Status: accepted
- Date: 2026-05-31

## Context

caratula is a monorepo with multiple packages (`core`, `cli`, and deferred `web`/`desktop`/
`server`). We need a policy for both the project's own version and its dependencies. Options for
project versioning ranged from lockstep (one version for the whole repo) to independent
per-package versioning via Changesets.

## Decision

**Project version — lockstep, tag-driven SemVer.**

- One version for the whole repo. A `vX.Y.Z` git tag is the single source of truth and triggers
  the release workflow (`.github/workflows/release.yml`), which builds and publishes a GitHub
  Release with notes generated from Conventional Commits.
- Internal package versions move together; they are not published to npm yet.
- Pre-1.0 (`0.x`): a minor may include breaking changes; patch is fixes only. We reach **1.0**
  when the core API, the SVG output contract, and the CLI surface are stable.
- Revisit (adopt **Changesets**, independent versions) if/when packages are published to npm or
  gain external consumers.

**Dependencies.**

- `^` ranges in `package.json`; `pnpm-lock.yaml` committed as the source of truth. CI installs
  with `--frozen-lockfile` for reproducible builds.
- Toolchain pinned: `packageManager: pnpm@<version>`, `engines.node >=20`.
- Dependabot weekly (dev-deps grouped). Patch/minor: trust green CI. **Major: verify behavior**
  (build *and* run the CLI), not just types, until a runtime test suite exists.

## Consequences

- Releasing is one command: tag and push. No version-bump ceremony pre-1.0.
- Mutually-conflicting dependency bumps (shared workflow files / lockfile) may be consolidated
  into a single verified commit rather than merged one-by-one — same end state, less churn.
- The disabled CI test step (see TODO) is the gap that currently makes major bumps a manual
  verification; closing it (validator unit tests) restores automation.
