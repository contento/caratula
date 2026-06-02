# 0002 — All-TypeScript monorepo

- Status: accepted
- Date: 2026-05-31

## Context

caratulai needs four surfaces — web, TUI/CLI, desktop, backend — on Windows/macOS/Linux/Web.

Candidate directions: all-TypeScript, Rust-core + Tauri/ratatui, or polyglot (Python core).

## Decision

Adopt an **all-TypeScript monorepo** (pnpm workspaces + Turborepo). A pure `core` package holds the engine; thin packages wrap it per surface:

- `core` — ontology, palette engine, prompt builder, LLM provider router, SVG validator, export
- `cli` — TUI/CLI (built first)
- `web` — SvelteKit or React (deferred)
- `desktop` — Tauri 2, reuses web UI (deferred)
- `server` — Hono backend + DB (deferred)

DB via Drizzle over SQLite (local-first) and Postgres (remote). Export via `@resvg/resvg-js`, `sharp`, `pdf-lib`, `png-to-ico`.

## Consequences

- One language across all surfaces → maximum reuse; SVG is web-native (free preview/manipulation).
- Rust-quality rasterization available through native bindings without leaving TS.
- If hot paths or single-binary distribution demand it, drop to a **Rust** Tauri sidecar; for formal OWL reasoning or local diffusion, add a **Python** microservice. Start in TS; descend only where measured.

## First milestone

Build `core` + `cli`: `tags → prompt → LLM → SVG → validate → export`.
