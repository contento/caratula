# Data Model

## Core Entities

### Concept / Tag

An ontology node — the fundamental unit of meaning.

- **id** — unique identifier
- **label** — human-readable name
- **parents** — parent concepts in the ontology hierarchy
- **relations** — semantic relationships to other concepts (e.g., "is-a", "part-of")
- **synonyms** — alternative names

Example: `star` (concept) with relations to `celestial`, `light`, `symbol`.

### Palette

A color scheme for generation.

- **id** — palette identifier (e.g., `sagan`, `sepia`, `grayscale`)
- **kind** — bit depth or type (`1-bit`, `grayscale`, `sepia`, `palette-16`, `palette-256`)
- **colors** — ordered list of hex color values
- **metadata** — profile, historical source, mood/tone

### Generation

A request to generate an image, plus its result.

- **tags[]** — concept tags driving the image
- **palette** — chosen palette (id)
- **profile** — generation profile (sagan, picasso, contento, etc.)
- **model** — LLM model used
- **params** — temperature, seed, max_tokens, etc.
- **prompt** — final prompt sent to the LLM
- **timestamp** — when generated

### Image

The output of a Generation.

- **svg** — SVG source (text)
- **generation_id** — reference to the Generation that created it
- **validation_report** — pass/fail on each [[Principles|constraint]]
- **exports** — linked PDF, PNG, JPEG, ICO files
- **metadata** — full Generation metadata (for reproducibility)

## Relationships

```
Concept ──► (parent/sibling) ◄── Concept
   ↓
Tag (instance of a Concept)
   ↓
Generation (uses tags + palette + profile + model)
   ↓
Image (stores SVG + validation report)
   ↓
Exports (PNG, PDF, JPEG, ICO)
```

## Reproducibility Contract

Every Image stores enough metadata to regenerate it exactly:

- Generation ID
- Tags (exact list)
- Palette ID
- Profile name
- Model name
- Seed
- Temperature
- Timestamp

Given these inputs, the LLM + validator pipeline should produce identical output (or near-identical, depending on model determinism).

## Future: Dictionary Profile

The [[design/02-Dictionary Profile]] extends this model with:

- **Primitives** — atomic SVG parts with semantic tags
- **Poses** — assembled primitives
- **Scenes** — composed poses with spatial relationships

See [[design/02-Dictionary Profile]] for the full ontological dictionary schema.
