# CLAUDE.md — instructions for working in this repo

Project: **caratulai** — an alien image generator. Concepts (tags/ontology) → simple **vector**
images in fundamental palettes. See [SPEC.md](SPEC.md) and [README.md](README.md).

## Working agreement

- Early-stage project. Prefer small, reversible steps over big upfront structure.
- Record non-obvious decisions as short ADRs in `docs/decisions/`.
- Keep [SPEC.md](SPEC.md) current — resolve items in "Open questions" as decisions land.
- Track outstanding work in [TODO.md](TODO.md).

## graphify

This project has a knowledge graph at `graphify-out/`.

- For codebase questions, run `graphify query "<question>"` (scoped subgraph, smaller than
  GRAPH_REPORT.md or grep). Use `graphify path "A" "B"` for relationships, `graphify explain "X"`
  for one concept.
- After changing code, run `graphify update .` (AST-only, no API cost) to keep the graph current.
- Read `graphify-out/GRAPH_REPORT.md` only for broad architecture review.

## Aesthetic guardrails (these are requirements, not taste)

- **Vector first** — SVG is the default output; raster/PDF are exports.
- **Fundamental palettes only** — B/W, sepia, grayscale, 16, 256. **No rainbows, no rococo/baroque.**
- **Simple lines** — line, arc, diagonal, basic shapes. Minimize element count.
- **Little or no text** in generated images.
- Generated images must pass the **validator/sanitizer** (palette-snap, allowed primitives, complexity cap).
- **Default to LLM-generates-SVG**, not diffusion. Diffusion is an opt-in mode only.

## Tech stack

All-TypeScript monorepo (pnpm workspaces + Turborepo). See [ADR 0002](docs/decisions/0002-typescript-monorepo.md).

- `packages/core` — pure engine: ontology, palettes, prompt builder, LLM providers, SVG validator, export
- `packages/cli` — TUI/CLI (built first); commander-based
- `packages/{web,desktop,server}` — deferred (SvelteKit/React · Tauri 2 · Hono + Drizzle)

## Conventions

- Workspace packages are ESM TypeScript, `@caratulai/<name>` scope.
- `core` stays I/O-agnostic — no direct DB/filesystem in the engine; surfaces inject those.
- Built-in palettes and the SVG sanitizer are the source of truth for the aesthetic constraints.

## How to run / test

<!-- TODO: commands to build, run, and test. -->

## Guardrails

- Don't invent scope or stack beyond SPEC.md — confirm choices that aren't recorded there.
- Don't touch generated-output directories or the image/metadata store <!-- (name once they exist) -->.
