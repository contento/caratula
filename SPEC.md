# caratula — Spec

An **alien image generator**: concepts (tags/ontology) → simple **vector** images in
**fundamental palettes**. Lineage: contento/conten.to · Voyager Golden Record · Picasso's line.

See [README.md](README.md) for the vision and the original founding prompt.

## Goals

- Turn a set of **tags** (drawn from an ontology) into a **simple SVG image**.
- Enforce a **fundamental aesthetic**: minimal palette, simple line/arc/diagonal, little/no text.
- Make every image **reproducible** from its stored metadata (tags, palette, model, params, seed).
- Generate **many variations** of one concept by sweeping hyperparameters.
- Run on **Web, TUI/CLI, Desktop, Backend**, across **Windows/macOS/Linux/Web**.

## The aesthetic (hard constraints)

These are validation rules, not just guidance:

- **Palettes:** `bw` (1-bit), `grayscale`, `sepia`, `palette-16`, `palette-256`. Even at 16/256,
  colors are **fundamental and harmonious** — restrained hue, earth/primary tones. **No full
  spectrum, no rainbows, no rococo/baroque ornamentation.**
- **Primitives:** `line`, `path` (arcs/diagonals/curves), `circle`, `polygon`. Minimal element count.
- **Text:** none by default; if allowed, a single short label maximum.
- **Output is vector (SVG) by default.** Everything else is an export.

## Architecture

**Keystone decision:** images are generated as **SVG by an LLM** (text generation), *not* by a
diffusion model. This gives palette control, clean vectors, cheap iteration, and the symbolic
"alien" quality. Diffusion is an optional later mode, not the core. See `docs/decisions/`.

Pipeline:

```text
tags + ontology + palette + constraints
   └─▶ prompt builder ─▶ LLM provider (ladder: cheap→costly, local→remote) ─▶ raw SVG
        └─▶ validator/sanitizer (palette-snap · strip text · allowed primitives only · complexity cap)
             └─▶ store (file + DB, full metadata) ─▶ export (PDF / PNG / JPEG / ICO)
```

**Variation engine:** a generation *matrix* sweeping `{tags × palette × model × temperature × seed}`,
producing a gallery; every cell stored with metadata so any image is reproducible.

## Recommended stack (proposal — see Open question #1)

TypeScript monorepo (one language across all four surfaces → maximum reuse; SVG is web-native).

- **Monorepo:** pnpm workspaces + Turborepo
- **`core`** (pure TS): ontology, palette engine, prompt builder, provider router, SVG validator, export
- **LLM providers:** Anthropic (Claude — strong SVG) · OpenAI · Google · **Ollama** (local). Interface + model ladder.
- **Rasterize/export:** `@resvg/resvg-js` (SVG→PNG, Rust-backed) · `sharp` (JPEG) · `pdf-lib`/`svg2pdf` (PDF) · `png-to-ico`
- **Web:** SvelteKit (lean) or React+Vite
- **Desktop:** Tauri 2 (tiny multiplatform binaries, reuses web UI; Rust sidecar available)
- **TUI/CLI:** Ink + clipanion/commander; in-terminal preview via chafa/half-block raster
- **Backend:** Hono
- **DB + ORM:** Drizzle over SQLite (local-first) and Postgres (remote/shared) — same schema
- **Ontology/metadata:** taxonomy tables + optional RDF/Turtle export (could feed `graphify`)

Optional later: **Rust** sidecar for hot paths / single-binary builds; **Python** microservice for
OWL reasoners or local diffusion. Start in TS; drop down only where measured.

## Data model (sketch)

- **Concept / Tag** — ontology node (id, label, parents, relations, synonyms).
- **Palette** — id, kind, ordered color list.
- **Generation** — tags[], palette, model, params (temp/seed/...), prompt, timestamp.
- **Image** — SVG source, derived from a Generation, plus exports + validation report.

## Inputs & outputs

- **Input:** tag set + palette + constraints (CLI flags, TUI form, web form, or API request/JSON).
- **Input (caratulize):** an uploaded image (restricted format/size/dimensions) → a vision model
  reduces it to a caratula (ES: *caratulizar*). Same validator pipeline. See Roadmap **M6**.
- **Output:** SVG (default) → exports: **PDF, PNG, JPEG, ICO** (+ suggest: WebP, EPS).
- **Persistence:** files **and/or** DB (SQLite or Postgres), selectable.

## Non-goals (v1)

- Diffusion/raster generation as the primary path (optional mode only).
- Full document/body composition — caratula makes the *image*, not the document.
- WYSIWYG vector editor (it generates; external tools edit).
- Multi-user accounts / collaboration.
- Colorful, ornate, or photorealistic output — out of scope **by design**.

## Open questions

1. ~~**Stack direction**~~ → **Resolved: all-TypeScript monorepo** ([ADR 0002](docs/decisions/0002-typescript-monorepo.md)).
2. ~~**First surface to build**~~ → **Resolved: core + CLI first.**
3. **Web framework:** SvelteKit vs React. *(deferred until web package starts)*
4. **Default palette + first concepts:** which ontology seed do we start with?
5. **Local model:** which Ollama model is the baseline for SVG (quality vs cost)?
6. **Palette enforcement:** strict color-snapping (guaranteed) vs prompt-only (looser)?
