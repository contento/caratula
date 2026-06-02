# caratulai — Roadmap

Organized as **milestones** (a shippable increment with a goal) → **tasks** (checkboxes).
Keep this current; promote big decisions to `docs/decisions/`. Open questions live in
[SPEC.md](SPEC.md). Versioning is lockstep + tag-driven ([ADR-0003](docs/decisions/0003-versioning.md)).

Legend: ✅ done · 🟡 in progress · ⬜ not started · ⭐ new

---

## M0 — Foundation ✅

> Goal: a buildable monorepo, a working engine skeleton, and a public repo.

- [x] Founding docs: README (vision + founding prompt), SPEC, CLAUDE.md
- [x] ADRs: 0001 (LLM-SVG), 0002 (TS monorepo), 0003 (versioning)
- [x] Monorepo scaffold (pnpm + Turborepo + tsconfig base)
- [x] `core` engine: types, palettes (+ color-snap), prompt builder, validator, providers, generate
- [x] `cli`: `palettes` + `generate` commands (runs end to end with Echo placeholder)
- [x] graphify knowledge graph (`graphify-out/`)
- [x] Public GitHub repo: MIT, CI, tag-driven release, Dependabot, issue/PR templates, topics

---

## M1 — Real generation 🟡

> Goal: replace the Echo placeholder with real LLMs producing valid, on-aesthetic SVG.

- [x] **OpenAI-compatible provider** base (shared by all chat-completions backends)
- [x] **Ollama provider** (local, free)
- [x] **LM Studio provider** (local, free)
- [x] **OpenRouter provider** (remote — Grok + cheap models)
- [x] CLI wiring: `--provider` / `--model` / `--base-url`; minimalist `SYSTEM_PROMPT`
- [x] Provider docs ([docs/providers.md](docs/providers.md)) + `.env.example`
- [x] **Test suite** (Vitest): 69 tests across validator, palettes, prompt, generate, providers,
      model ladder, HTTP provider (mocked fetch), factories — coverage thresholds enforced (≥98%)
- [x] Re-enable the CI `test` step (now runs with coverage gating)
- [x] **Image generation profiles** (aesthetic styles — 4 of 7 done):
  - [x] sagan — Voyager Golden Record (gold + silver)
  - [x] picasso — elegant lines, minimal (single-line B/W, 20 elements)
  - [x] contento — less restrained, 80+ shapes, dense composition
  - [x] dictionary — vocabulary-based patterns (256-color, 60 elements)
  - [ ] **freud** — layers of the psyche (grayscale + sepia, concentric structures)
    - [ ] Define id/ego/superego visual metaphors (nested layers)
    - [ ] Map defense mechanisms and complexes to symbolic patterns
    - [ ] Design prompt tone: dream-like introspection, unconscious drives, layered symbolism
  - [ ] **jung** — archetypal symbols (psychological/symbolic depth)
    - [ ] Define Jungian archetype vocabulary (shadow, anima, self, hero, etc.)
    - [ ] Map concepts to archetypal visual primitives
    - [ ] Design prompt tone: mythic, symbolic, transpersonal
  - [ ] **nietzsche** — full ontology-driven (rename to reflect philosophy?)
    - [ ] Leverage full M3 ontology (concept taxonomy + relations)
    - [ ] Map concept hierarchies to visual hierarchies (parent→child shapes)
    - [ ] Design prompt tone: dialectical, relational, genealogical
- [ ] Verify against a live local model (Ollama/LM Studio) and tune the prompt
  - [ ] Test sagan profile with Ollama qwen2.5-coder or similar
  - [ ] Test contento profile — verify 80-element density achievable
  - [ ] Tune profile prompts if needed based on model behavior
- [ ] **Anthropic provider** (Claude — strongest at SVG), with prompt caching
  - [ ] Claude API integration (requires ANTHROPIC_API_KEY)
  - [ ] Implement prompt caching for repeated profiles/concepts
  - [ ] Benchmark against Grok-2 for quality vs cost
- [ ] Model ladder wiring (local first, escalate to remote)
  - [ ] Default: Ollama (free, local) → LM Studio (free, local) → OpenRouter (paid, remote)
  - [ ] CLI: auto-retry with next model in ladder on failure

---

## M2 — Export

> Goal: turn SVG into the shareable formats from the founding prompt.

- [ ] SVG → PNG / JPEG (`@resvg/resvg-js`, `sharp`)
- [ ] SVG → PDF (`pdf-lib` / `svg2pdf`)
- [ ] SVG → ICO (`png-to-ico`)
- [ ] `caratulai export <svg> --to png,pdf,...` command
- [ ] Decide extra formats (WebP, EPS?) — see SPEC

---

## M3 — Ontology & concepts

> Goal: tags come from a real taxonomy, not free strings.

### Ontology extraction layer (prerequisite)

- [ ] Design: extraction contracts in `core` vs surfaces ([ONTOLOGY_EXTRACTION.md](docs/ONTOLOGY_EXTRACTION.md))
- [ ] `core/extract.ts`: `extractConceptsFromText()` — LLM reduces narrative to tags
- [ ] CLI: wire `--from-text` flag to extract before generation
- [ ] `core/extract.ts`: `buildExtractionPrompt()` — what to ask the LLM
- [ ] Test extraction: verify that "A starry ocean" → concepts like `["star", "water"]`

### Taxonomy & resolution

- [ ] Seed a first concept domain (SPEC open question #4)
- [ ] Concept/tag model + relations (taxonomy)
- [ ] Tag resolution: input → canonical concepts → prompt (use extracted tags + M3 taxonomy)
- [ ] Optional RDF/Turtle export (could feed graphify)

---

## M4 — Variation & gallery

> Goal: many ideas per concept, swept over hyperparameters.

- [ ] `caratulai vary` — surface `generateVariations` (palette × seed × model sweep)
- [ ] Gallery output (contact sheet / index of variations)
- [ ] Reproducibility check: re-run from stored params reproduces the image

---

## M5 — Persistence

> Goal: save generations + metadata to files and/or DB.

- [ ] Drizzle schema: concepts, palettes, generations, images
- [ ] SQLite (local-first) + Postgres (remote/shared), same schema
- [ ] Save / list / load generations from the CLI
- [ ] File-based store option (SVG + sidecar metadata)

---

## M6 — Caratulize (image input) ⭐

> Goal: upload an image (with restrictions) and **caratulize** it (ES: *caratulizar*) —
> reduce it to a simple vector caratulai in a fundamental palette. The image→caratulai byproduct
> of the LLM-SVG pipeline: a vision model reads the image and emits constrained SVG, which then
> runs through the same validator/sanitizer.

### Image input (TODO)

- [ ] `--from-image <path>`: accept local image file, extract visual concepts
- [ ] `--from-image-url <url>`: fetch remote image, extract visual concepts
- [ ] Vision provider interface (multimodal: `extractConceptsFromImage(image, provider)`)

### Image extraction (ontology from image)

- [ ] Vision provider interface (multimodal: `extractConceptsFromImage(image, provider)`)
- [ ] `core/extract.ts`: vision extraction — image → tags (reuse extraction layer from M3)
- [ ] Test extraction: verify that a photo → visual concepts

### Caratulize command

- [ ] Input restrictions: allowed formats (PNG/JPEG/WebP), max dimensions, max file size
- [ ] `caratulai caratulize <image>` command (alias: `caratulizar`)
- [ ] Reuse the validator pipeline (palette-snap, allowed primitives, complexity cap, no text)
- [ ] Safety/content checks on uploads (reject unsupported or disallowed content)
- [ ] Tune the "simplify, don't reproduce" prompt so output is a caratulai, not a tracing
- Depends on: M1 (a real provider) + M3 extraction layer. Feasible to pull earlier once one vision model is wired.

---

## M7 — Web GUI (YAML editor + gallery)

> Goal: interactive testing of profiles, YAML config, and image gallery before building surfaces.
> Unblocks: verify M1 + M3 are solid, test all profiles with real models, gather feedback on UX.
> Blocks: M8 (Tauri/web/server implementation).

- [ ] **Frontend** (SvelteKit, localhost:5173)
  - [ ] YAML editor pane (syntax highlight, live validation)
  - [ ] SVG live preview (renders generated image in real-time)
  - [ ] Parameter tweaker (profile, seed, palette, temperature dropdowns)
  - [ ] Generate button → invoke backend
  - [ ] Output gallery (browse all past generations, timestamps, delete)
  - [ ] Download SVG / export to PNG/PDF (future: M2 export)
- [ ] **Backend** (Node.js + Hono or Express)
  - [ ] Load/save `caratulai.config.yaml` from disk
  - [ ] Invoke `@caratulai/core` generate() with YAML + tweaked params
  - [ ] Manage `output/` directory (list, delete, metadata)
  - [ ] WebSocket for live generation progress (optional, nice-to-have)
- [ ] **Testing**
  - [ ] Test all 6 profiles with real Ollama/LM Studio models
  - [ ] Gather UX feedback (what parameter tweaks matter most?)
  - [ ] Verify M1 + M3 readiness before scaling to surfaces

---

## M8 — Surfaces (Tauri + Web + Server)

> Goal: the four faces over the same engine (web GUI now proven via M7).

- [ ] **Desktop** — Tauri 2 (wraps M7 frontend, native on Mac/Win/Linux)
  - [ ] Package M7 SvelteKit build into Tauri app
  - [ ] Backend runs in Tauri process (Node or Rust)
  - [ ] File access (config, output dir) via Tauri IPC
- [ ] **Web** — Deploy M7 frontend + backend to cloud
  - [ ] Backend: Hono on Cloudflare Workers / AWS Lambda / Railway
  - [ ] Frontend: static SvelteKit build on Vercel / Netlify
  - [ ] Shared gallery (multi-user, optional auth)
- [ ] **Server** — Hono API + DB (shared/remote store)
  - [ ] REST API for `generate`, `list`, `delete` generations
  - [ ] Drizzle ORM + SQLite/Postgres for persistence
  - [ ] Rate limiting, API keys

---

## M9 — Dictionary Profile (Ontological Symbol Composition)

> Goal: transform caratulai from one-shot generator into a semantic symbol library.
> Vision: *"Every illustration makes the dictionary richer."*
> See: [docs/dictionary-profile.md](docs/dictionary-profile.md)

- [ ] **Phase 1: Foundation**
  - [ ] Define `profile/index.json` schema (primitives, poses, scenes, concepts, relationships)
  - [ ] File validator (reference integrity, no cycles)
  - [ ] SVG `<use>` resolver (primitives → poses → scenes)
  - [ ] CLI `compose` command (query dictionary → assemble SVG)
  - [ ] Palette CSS (single source of truth for color)
  - [ ] First primitive set (animals: dog, cat, lion, camel, bird)
  - [ ] First pose set (sitting, walking, resting, standing, kneeling)

- [ ] **Phase 2: Gap Detection & Auto-Design**
  - [ ] LLM extractor: scene request → needed primitives + gaps
  - [ ] Gap detector: which concepts missing from dictionary?
  - [ ] Designer LLM: generate SVG for missing primitives
  - [ ] Auto-register: add to index.json + save files

- [ ] **Phase 3: Semantic Querying**
  - [ ] Query by meaning ("show things that symbolize defiance")
  - [ ] Relationship traversal ("what's related to lion/roaring?")
  - [ ] Suggest reuse ("this concept could use [existing primitives]")

- [ ] **Phase 4: Dictionary Browser**
  - [ ] Static HTML viewer over index.json
  - [ ] Search by tag, symbol, relationship
  - [ ] Visual preview of each primitive/pose/scene
  - [ ] Edit metadata (tags, relationships, symbolism)

---

## M10 — 1.0

> Goal: stabilize and ship a real release.

- [ ] Freeze the core API, SVG output contract, and CLI surface
- [ ] Examples gallery / docs
- [ ] Tag `v1.0.0` (triggers the release workflow)

---

## Open questions (see [SPEC.md](SPEC.md))

- [ ] Web framework: SvelteKit vs React
- [ ] Default palette + first concepts
- [ ] Baseline local model for SVG (quality vs cost)
- [ ] Palette enforcement: strict color-snap vs prompt-only

## Backlog / ideas

- [ ] Diffusion as an opt-in mode (non-default; see ADR-0001)
- [ ] Palette designer / custom fundamental palettes
- [ ] Batch/CSV concept input
