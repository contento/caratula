# Tech Stack

## Architecture Overview

**Keystone decision:** images are generated as **SVG by an LLM** (text generation), *not* by a diffusion model. This gives palette control, clean vectors, cheap iteration, and the symbolic "alien" quality. See [[decisions/ADR-0001 LLM Generates SVG]].

### Generation Pipeline

```
tags + ontology + palette + constraints
   ↓
buildPrompt() → LLM provider (ladder: cheap→costly, local→remote) → raw SVG
   ↓
validator/sanitizer (palette-snap · strip text · allowed primitives only · complexity cap)
   ↓
store (file + DB, full metadata) → export (PDF / PNG / JPEG / ICO)
```

### Variation Engine

A generation *matrix* sweeping `{tags × palette × model × temperature × seed}`, producing a gallery. Every cell is stored with metadata so any image is reproducible.

## Tech Stack (TypeScript Monorepo)

All-TypeScript monorepo (pnpm workspaces + Turborepo). See [[decisions/ADR-0002 TypeScript Monorepo]].

### Core Packages

| Package | Role |
|---|---|
| **packages/core** | Engine: types, palettes, prompt builder, LLM providers, SVG validator, export |
| **packages/cli** | Command-line interface (built first); commander-based |
| **packages/web** | Web UI (deferred) — SvelteKit or React |
| **packages/desktop** | Desktop app (deferred) — Tauri 2, reuses web UI |
| **packages/server** | Backend (deferred) — Hono + Drizzle |

### Core Technologies

**Build & Package Management:**
- Monorepo: pnpm workspaces + Turborepo
- Language: TypeScript (ESM, strict mode)
- Node: ≥ 20

**LLM Providers:**
- Anthropic (Claude — strong SVG) · OpenAI · Google · **Ollama** (local)
- Interface + model ladder for cost/quality trade-off

**Rasterize / Export:**
- `@resvg/resvg-js` — SVG→PNG (Rust-backed, fast)
- `sharp` — JPEG
- `pdf-lib` / `svg2pdf` — PDF
- `png-to-ico` — ICO

**Database & ORM (deferred surfaces):**
- Drizzle over SQLite (local-first) and Postgres (remote/shared)
- Same schema across both

**Web (deferred):**
- SvelteKit (lean) or React + Vite

**Desktop (deferred):**
- Tauri 2 (tiny multiplatform binaries, reuses web UI)

**TUI/CLI:**
- Ink + clipanion/commander
- In-terminal preview via chafa/half-block raster

**Backend (deferred):**
- Hono

### Conventions

- Workspace packages are **ESM TypeScript**, `@caratulai/<name>` scope.
- **`core` stays I/O-agnostic** — no direct DB/filesystem in the engine; surfaces inject those.
- **Built-in palettes and the SVG sanitizer are the source of truth** for [[Principles|aesthetic constraints]].

### Future Extensions

Optional: **Rust** sidecar for hot paths / single-binary builds; **Python** microservice for OWL reasoners or local diffusion. Start in TS; drop down only where measured.

## Surfaces

One core engine, **four faces**:

- **Web** — full-featured browser UI
- **TUI/CLI** — command-line interface (built first, MVP working now)
- **Desktop** — native app (macOS, Windows, Linux via Tauri)
- **Backend** — HTTP server + DB, multi-user, shared library

All share the same `@caratulai/core` engine and run on **Windows, macOS, Linux, Web.**

## Input & Output

**Input:**
- Tag set + palette + constraints (CLI flags, TUI form, web form, or API request/JSON).
- Image upload (M6: Caratulize) — restricted format/size/dimensions → vision model → ontology.

**Output:**
- **SVG** (default) → exports: **PDF, PNG, JPEG, ICO** (+ suggest: WebP, EPS).

**Persistence:**
- Files **and/or** DB (SQLite or Postgres), selectable.

## See Also

- [[decisions/ADR-0002 TypeScript Monorepo]] — the monorepo choice and its consequences
- [[17-Roadmap]] — milestones and when each surface ships
- [[10-Configuration]] — config.yaml and .env setup
