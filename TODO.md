# caratula — TODO

Working roadmap. Keep checkboxes current; move big decisions to `docs/decisions/`.

## Done

- [x] Founding docs: README, SPEC, CLAUDE.md, ADR-0001 (LLM-SVG), ADR-0002 (TS monorepo)
- [x] Monorepo scaffold (pnpm + Turborepo + tsconfig base)
- [x] `core` engine: types, palettes (+ color-snap), prompt builder, validator, providers, generate
- [x] `cli`: `palettes` and `generate` commands — runs end to end with the Echo placeholder
- [x] graphify knowledge graph (`graphify-out/`)

## Next

- [ ] **Real LLM provider** — Ollama (local, free) first, then Anthropic (best SVG) behind `ModelLadder`
- [ ] **Export command** — `caratula export`: SVG → PNG/JPEG (`@resvg/resvg-js`, `sharp`), PDF (`pdf-lib`), ICO (`png-to-ico`)
- [ ] **Seed ontology** — pick the first concept domain (SPEC open question #4) and a starter tag set
- [ ] **Variation gallery** — `caratula vary`: surface `generateVariations` (palette × seed sweep)
- [ ] **Persistence** — store generations + metadata (Drizzle over SQLite, local-first)
- [ ] Tests for the validator (palette-snap, primitive/text/complexity rules)

## Open questions (see SPEC.md)

- [ ] Web framework: SvelteKit vs React
- [ ] Default palette + first concepts
- [ ] Baseline local model for SVG (quality vs cost)
- [ ] Palette enforcement: strict color-snap vs prompt-only

## Later surfaces

- [ ] `web` (SvelteKit/React) · [ ] `desktop` (Tauri 2) · [ ] `server` (Hono + DB)
