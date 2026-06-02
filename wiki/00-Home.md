# caratulai Wiki

Welcome to the caratulai knowledge base. caratulai is an **alien image generator**: concepts (tags/ontology) → simple vector images in fundamental palettes.

## Getting Started

- [[09-Getting Started]] — install, build, first generation
- [[10-Configuration]] — config.yaml and .env
- [[11-LLM Providers]] — how to set up local (LM Studio, Ollama) and remote (OpenRouter) backends
- [[12-Testing Local Models]] — quick-start for testing on your machine

## Project Knowledge

- [[01-Vision]] — why caratulai exists, the founding prompt, the musical analogy
- [[02-Principles]] — the 7 hard aesthetic constraints (enforced, not optional)
- [[03-Profiles]] — the 7 generation profiles (sagan, picasso, contento, dictionary, freud, jung, nietzsche)
  - **Future profiles (detailed seeds):**
    - [[Freud Profile Seed]] — layers of the psyche (id/ego/superego, defense mechanisms, dream logic)
    - [[Jung Profile Seed]] — archetypal symbols (hero, shadow, anima/animus, self, mandalas)
    - [[Nietzsche Profile Seed]] — genealogy of concepts (master/slave morality, will-to-power, eternal recurrence)
- [[04-Stack]] — tech stack, monorepo layout, pipeline, surfaces
- [[05-Data Model]] — Concept, Tag, Palette, Generation, Image
- [[08-Open Questions]] — decisions still pending

## Design & Architecture

- [[17-Roadmap]] — M0–M10 milestones
- [[06-Ontology Seed]] — foundational concept taxonomy (visual, abstract, relationships)
- [[07-LLM and Ontology]] — how to express ontologies to LLMs; model specialization
- [[design/01-Ontology Extraction]] — how input is normalized to an ontology
- [[design/02-Dictionary Profile]] — the dictionary profile vision (Tier 2–4 composition)

## Decisions

- [[decisions/00-ADR Index]] — all architecture decisions
- [[decisions/01-ADR-0001 LLM Generates SVG]] — why we generate SVG from LLMs, not diffusion
- [[decisions/02-ADR-0002 TypeScript Monorepo]] — stack choice (TypeScript + pnpm + Turborepo)
- [[decisions/03-ADR-0003 Versioning]] — lockstep SemVer, tag-driven releases

## Contributing

- [[13-Contributing]] — development setup, conventions, PR process, releases
