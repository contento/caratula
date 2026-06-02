# Architecture Decision Records (ADRs)

| # | Title | Status | Date | Summary |
|---|---|---|---|---|
| [[ADR-0001 LLM Generates SVG\|0001]] | Images are LLM-generated SVG, not diffusion raster | Accepted | 2026-05-31 | Core generation path is an LLM emitting SVG as text, constrained by palette/aesthetic rules and validated post-process. Diffusion is opt-in only. |
| [[ADR-0002 TypeScript Monorepo\|0002]] | All-TypeScript monorepo | Accepted | 2026-05-31 | Adopt pnpm workspaces + Turborepo. One language across all surfaces (web, TUI/CLI, desktop, backend) → maximum reuse. |
| [[ADR-0003 Versioning\|0003]] | Versioning: lockstep, tag-driven SemVer | Accepted | 2026-05-31 | One version for the whole repo. A `vX.Y.Z` git tag is the source of truth and triggers the release workflow. |

## How to add an ADR

1. Create a new note: `ADR-NNNN <Title>` in `wiki/decisions/`
2. Use the template below
3. Update this index

## Template

```markdown
# NNNN — Title

- Status: proposed / accepted / superseded
- Date: YYYY-MM-DD

## Context

Why did we need to make this decision? What's the problem or constraint?

## Decision

What did we decide and why?

## Consequences

What changes as a result? Benefits? Trade-offs?
```
