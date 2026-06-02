# CLAUDE.md — AI working instructions

Project: **caratulai** — an alien image generator. Concepts (tags/ontology) → simple **vector** images in fundamental palettes. **Full wiki:** [[wiki/00-Home]]

## Working agreement

- Early-stage project. Prefer small, reversible steps over big upfront structure.
- Record non-obvious decisions as short ADRs in `wiki/decisions/`.
- Keep [[wiki/Open Questions]] current — resolve items as decisions land.
- Track outstanding work in [[wiki/Roadmap]].

## graphify

This project has a knowledge graph at `graphify-out/`.

- For codebase questions, run `graphify query "<question>"` (scoped subgraph, smaller than GRAPH_REPORT.md or grep).
- Use `graphify path "A" "B"` for relationships, `graphify explain "X"` for one concept.
- After changing code, run `graphify update .` (AST-only, no API cost) to keep the graph current.
- Read `graphify-out/GRAPH_REPORT.md` only for broad architecture review.

## Input pipeline: ontology at the root

- **Ontology is the core contract.** All input sources (direct tags, images, narrative text) must be converted to an ontology (a set of simple concept tags) before image generation.
- **Image input** → extract visual concepts → ontology tags.
- **Narrative text** → extract core concepts → ontology tags.
- **Direct tags** → validate and pass through as ontology.
- The generated image is **always driven by the final ontology**, never by the original narrative or image. This ensures predictable, tag-focused output that respects [[wiki/Principles|aesthetic constraints]].

## Conventions

- Workspace packages are ESM TypeScript, `@caratulai/<name>` scope.
- `core` stays I/O-agnostic — no direct DB/filesystem in the engine; surfaces inject those.
- Built-in palettes and the SVG sanitizer are the source of truth for [[wiki/Principles|aesthetic constraints]].

## See Also

- **[[wiki/01-Vision]]** — why it exists, name, musical analogy
- **[[wiki/02-Principles]]** — the 7 hard aesthetic constraints (required reading)
- **[[wiki/03-Profiles]]** — the 7 generation profiles and their specs
- **[[wiki/04-Stack]]** — tech stack, monorepo layout, architecture
- **[[wiki/17-Roadmap]]** — M0–M10 milestones
