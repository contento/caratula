# caratulai Wiki

Welcome to the caratulai knowledge base. caratulai is an **alien image generator**: concepts (tags/ontology) → simple vector images in fundamental palettes.

## Getting Started

- [[Getting Started]] — install, build, first generation
- [[Configuration]] — config.yaml and .env
- [[LLM Providers]] — how to set up local (LM Studio, Ollama) and remote (OpenRouter) backends
- [[Testing Local Models]] — quick-start for testing on your machine

## Project Knowledge

- [[Vision]] — why caratulai exists, the founding prompt, the musical analogy
- [[Principles]] — the 7 hard aesthetic constraints (enforced, not optional)
- [[Profiles]] — the 7 generation profiles (sagan, picasso, contento, dictionary, freud, jung, nietzsche)
- [[Stack]] — tech stack, monorepo layout, pipeline, surfaces
- [[Data Model]] — Concept, Tag, Palette, Generation, Image
- [[Open Questions]] — decisions still pending

## Design & Architecture

- [[Roadmap]] — M0–M10 milestones
- [[design/Ontology Extraction]] — how input is normalized to an ontology
- [[design/Dictionary Profile]] — the dictionary profile vision (Tier 2–4 composition)

## Decisions

- [[decisions/ADR Index]] — all architecture decisions
- [[decisions/ADR-0001 LLM Generates SVG]] — why we generate SVG from LLMs, not diffusion
- [[decisions/ADR-0002 TypeScript Monorepo]] — stack choice (TypeScript + pnpm + Turborepo)
- [[decisions/ADR-0003 Versioning]] — lockstep SemVer, tag-driven releases

## Contributing

- [[Contributing]] — development setup, conventions, PR process, releases
