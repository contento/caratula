# caratulai

[![CI](https://github.com/contento/caratulai/actions/workflows/ci.yml/badge.svg)](https://github.com/contento/caratulai/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Carátula** (Spanish): the cover sheet — the first image you meet.

An **alien image generator**: concepts (tags/ontology) → simple vector images in fundamental palettes.

Lineage: Voyager Golden Record · Picasso's line · contento/conten.to.

## Quick start

Requires Node ≥ 20 and pnpm (`corepack enable pnpm`).

```sh
pnpm install && pnpm build
node packages/cli/dist/index.js generate star water travel --palette sepia --out out/idea.svg
```

## Documentation

Full documentation lives in the wiki — open [wiki/](wiki/) as an Obsidian vault or read on GitHub.

- **[Vision](wiki/Vision.md)** — why this exists, the founding prompt, the musical analogy
- **[Getting Started](wiki/Getting%20Started.md)** — install, run, first generation
- **[Profiles](wiki/Profiles.md)** — aesthetic styles (sagan · picasso · contento · dictionary · ...)
- **[LLM Providers](wiki/LLM%20Providers.md)** — local (Ollama · LM Studio) and remote (OpenRouter)
- **[Roadmap](wiki/Roadmap.md)** — M0–M10 milestones
- **[Contributing](wiki/Contributing.md)** — dev setup, conventions, PRs

Status: early build. Core engine + CLI are working; web/desktop/server deferred.
