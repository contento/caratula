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

## Input pipeline: ontology at the root

- **Ontology is the core contract.** All input sources (direct tags, images, narrative text) must be
  converted to an ontology (a set of simple concept tags) before image generation.
- **Image input** → extract visual concepts → ontology tags.
- **Narrative text** → extract core concepts → ontology tags.
- **Direct tags** → validate and pass through as ontology.
- The generated image is **always driven by the final ontology**, never by the original narrative or image.
  This ensures predictable, tag-focused output that respects aesthetic constraints.

## Aesthetic guardrails (these are requirements, not taste)

**Goal:** Voyager Golden Record aesthetic — sophisticated, substantive, symbolic, elegant.
Think Carl Sagan's vision: diagrams a spacefaring civilization would understand. Dense with meaning, not simple.

- **Vector first** — SVG is the default output; raster/PDF are exports.
- **Fundamental palettes only** — B/W, sepia, grayscale, 16, 256. **No rainbows, no rococo/baroque.**
- **Rich & substantive** — 40–60 elements creating visual depth, intricate patterns, layered composition.
  All SVG shapes encouraged: paths, circles, polygons, groups, gradients, patterns, effects, text paths.
- **No text labels by default** — text distracts. When needed, use sparingly (shapes convey meaning).
- Generated images must pass the **validator/sanitizer** (palette-snap, SVG well-formedness, complexity cap).
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

## Configuration & Secrets

- **caratulai.config.yaml** — configuration (models, tags, ratio, seed, palette, output dir)
  - Committed to repo. Safe to share.
  - Readable YAML format. Easy to customize.
- **.env** — secrets only (API keys, local server URLs)
  - Gitignored. Never committed.
  - Copy .env.example, fill in your keys.
  
Separation of concerns: config is shareable, secrets are not.

## Image Generation Profiles

Seven profiles across the aesthetic spectrum (four implemented, three in development):

**Implemented:**

- **sagan** (default) — Voyager Golden Record. Gold background (#d4af37), silver text/lines (#c0c0c0).
  Voyager record plate aesthetic: technical, minimal, profound.
- **picasso** — Elegant, sophisticated lines. Minimal shapes. Single-line drawing style.
- **contento** — Less restrained. Rich complexity, 80+ elements, all shapes allowed.
  Dense, layered, visually abundant.
- **dictionary** — Dictionary-based generation. Uses visual vocabulary and pattern library.

**In development:**

- **freud** — Layers of the psyche. Grayscale + sepia, concentric structures for id/ego/superego.
- **jung** — Archetypal symbols. Psychological/symbolic depth (shadow, anima, self, hero).
- **nietzsche** — Full ontology-driven. Philosophical/conceptual mapping via concept hierarchies.

Set via `generation.profile` in caratulai.config.yaml or `--profile sagan` on CLI.

## Guardrails

- Don't invent scope or stack beyond SPEC.md — confirm choices that aren't recorded there.
- Don't touch generated-output directories or the image/metadata store <!-- (name once they exist) -->.
