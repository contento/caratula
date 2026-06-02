# Dictionary Profile — Ontological Symbol Composition

> *"Every illustration makes the dictionary richer."*

The **dictionary** profile transforms caratulai from a one-shot generator into a **civilization of symbols**. Instead of creating images from scratch, you build a growing dictionary of reusable SVG primitives organized around semantic and ontological relationships — then compose them into scenes.

---

## Core Vision

### Three-Tier Hierarchy

| Tier | Example | Description |
|---|---|---|
| **Primitives** | `dog/body`, `dog/head` | Atomic SVG shapes with semantic identity |
| **Poses** | `dog/sitting`, `dog/walking` | Assembled primitives in a configuration |
| **Scenes** | `man-walking-dog` | Composed poses with spatial relationships |

### Ontological Dictionary

Every entry in the dictionary carries:

- **Tags** — visual and semantic categories
- **relatedTo** — sibling concepts (e.g. `dog/sitting` ↔ `dog/resting`)
- **symbolizes** — abstract meaning (e.g. `lion/roaring` → `defiance`, `will`)
- **appearsIn** — which scenes use this primitive

This transforms a library into a **semantic graph of symbols**. Querying by meaning, not just shape.

### Grow-As-You-Use

When you request a scene and a needed primitive doesn't exist:

1. **Gap is detected** — concept not in dictionary
2. **Primitive is designed** — LLM reasons about visual representation
3. **Dictionary is updated** — full ontological metadata added
4. **Scene is composed** — using the new entry
5. **Reuse forever** — entry available to all future scenes

The dictionary only grows — nothing is recreated.

---

## Example: Zarathustra's Three Metamorphoses

A scene request like *"illustrate the three metamorphoses"* triggers a dictionary build:

```
NEEDED                   STATUS
─────────────────────────────────────
poses/camel/kneeling     ✓ create + register
poses/lion/roaring       ✓ create + register
poses/child/playing      ✓ create + register
concept/burden           ✓ design + register
concept/defiance         ✓ design + register
concept/sacred-yes       ✓ design + register
environments/desert      ✓ create + register
```

Each gap is designed once, registered with full metadata, and reused in every future scene.

---

## Architecture

### File Structure

```
profile/                          # Dictionary root
├── index.json                    # Ontological graph (schema below)
├── palette.css                   # Single color source of truth
│
├── primitives/                   # Atomic SVG parts
│   ├── dog/
│   │   ├── body.svg
│   │   ├── head.svg
│   │   └── tail.svg
│   ├── human/
│   ├── lion/
│   └── concept/
│       ├── burden.svg
│       ├── defiance.svg
│       └── sacred-yes.svg
│
├── poses/                        # Assembled configurations
│   ├── dog/
│   │   ├── sitting.svg
│   │   ├── walking.svg
│   │   └── resting.svg
│   ├── human/
│   ├── lion/
│   └── camel/
│       ├── kneeling.svg
│       └── carrying.svg
│
└── scenes/                       # Full composed illustrations
    ├── man-walking-dog.svg
    ├── zarathustra-metamorphoses.svg
    └── lion-vs-camel.svg
```

### Dictionary Schema (`profile/index.json`)

```json
{
  "primitives": {
    "dog/body": {
      "label": "Dog body",
      "tags": ["dog", "animal", "domestic", "quadruped"],
      "file": "primitives/dog/body.svg",
      "relationships": {
        "relatedTo": ["dog/head", "dog/tail"],
        "partOf": ["poses/dog/sitting", "poses/dog/walking"]
      },
      "symbolizes": ["loyalty", "domesticity", "companionship"],
      "appearsIn": ["scenes/man-walking-dog"]
    }
  },
  
  "poses": {
    "dog/sitting": {
      "label": "Dog sitting",
      "tags": ["dog", "calm", "domestic", "pose"],
      "uses": ["primitives/dog/body", "primitives/dog/head"],
      "file": "poses/dog/sitting.svg",
      "relationships": {
        "relatedTo": ["dog/resting", "dog/waiting"],
        "oppositeTo": ["dog/running"]
      },
      "symbolizes": ["patience", "obedience", "domesticity"],
      "appearsIn": ["scenes/man-walking-dog"]
    }
  },
  
  "scenes": {
    "man-walking-dog": {
      "label": "Man walking dog",
      "involves": ["poses/human/walking", "poses/dog/walking"],
      "relationships": {
        "human controls dog": ["lead", "companionship"],
        "spatial": "side-by-side"
      },
      "tags": ["activity", "pet", "urban", "relationship"],
      "file": "scenes/man-walking-dog.svg",
      "symbolizes": ["companionship", "care", "routine"]
    }
  },
  
  "concepts": {
    "burden": {
      "label": "Abstract burden",
      "file": "primitives/concept/burden.svg",
      "tags": ["abstract", "weight", "philosophy"],
      "relationships": {
        "symbolizes": ["weight", "service", "endurance"],
        "relatedTo": ["camel/kneeling", "concept/load"],
        "oppositeTo": ["concept/lightness"]
      },
      "appearsIn": ["scenes/zarathustra-metamorphoses"],
      "philosophy": "Nietzsche: camel as the bearer of burdens"
    }
  }
}
```

### SVG Reuse Pattern

Poses reference primitives via SVG `<use>`:

```svg
<!-- profile/poses/dog/sitting.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <use id="sitting-pose" href="../../primitives/dog/body.svg#body" y="10"/>
    <use href="../../primitives/dog/head.svg#head" x="20" y="-15"/>
    <use href="../../primitives/dog/tail.svg#tail" x="60" y="30"/>
  </defs>
</svg>
```

Scenes compose poses the same way. **Changing a primitive propagates everywhere.**

### Color System

All SVGs use CSS custom properties — no hardcoded hex values:

```css
/* profile/palette.css */
:root {
  --color-primary:    #3D405B;   /* Deep blue-gray */
  --color-warm:       #E07A5F;   /* Rust */
  --color-light:      #F4F1DE;   /* Cream */
  --color-accent:     #81B29A;   /* Sage green */
  --color-dark:       #2D3142;   /* Near black */
}
```

Swapping the palette file changes the visual language of the entire dictionary **instantly**.

---

## LLM Pipeline for Gap Detection

Two local models (via LM Studio / Ollama):

| Role | Model | Task |
|---|---|---|
| **Extractor** | Qwen 2.5-7B | Parse scene input → list needed primitives + gaps |
| **Designer** | Qwen 2.5-14B or Claude | Reason about how to render abstract concepts as SVG |

The pipeline:

1. **Parse scene request** → entities, relationships, gaps
2. **Query dictionary** → what exists? what's missing?
3. **Design gaps** → LLM generates SVG for missing primitives
4. **Register** → add to `index.json` with full metadata
5. **Compose** → assemble scene from dictionary

---

## Implementation Phases

### Phase 1: Foundation (M7-M8)

- [ ] Define `profile/index.json` schema
- [ ] Build file validator (all references valid, no cycles)
- [ ] Implement SVG `<use>` resolver
- [ ] CLI `compose` command: load dictionary → compose scene
- [ ] First primitive set: animals (dog, cat, lion, camel, bird)
- [ ] First pose set: basic poses (sitting, walking, resting, standing)

### Phase 2: Gap Detection & Auto-Design (M9)

- [ ] LLM extractor: "show Zarathustra's camel" → `[camel/body, camel/kneeling, concept/burden]`
- [ ] Gap detector: which primitives missing?
- [ ] Designer LLM: generate SVG for gaps
- [ ] Auto-register: add to `index.json` + save SVG file

### Phase 3: Semantic Querying (M10)

- [ ] Query by meaning: "show me things that symbolize defiance"
- [ ] Relationship traversal: "what's related to lion/roaring?"
- [ ] Suggest reuse: "this new concept could use [these existing primitives]"

### Phase 4: Dictionary Browser (M11)

- [ ] Static HTML viewer over `profile/index.json`
- [ ] Search by tag, symbol, relationship
- [ ] Visual preview of each primitive/pose/scene
- [ ] Edit metadata (add tags, relationships, symbolism)

---

## Philosophy

> *"Every illustration makes the dictionary richer."*

**caratulai's dictionary** is a **civilization of symbols**, not a clip-art library.

The ontological layer (`symbolizes`, `relatedTo`, `appearsIn`) means you can query **meaning**, not just shape. The camel you build for Zarathustra is the same camel that carries weight in every future scene where endurance matters.

### Key Principles

1. **Reuse over recreation** — build once, compose forever
2. **Semantic relationships** — tag by meaning, not just visual appearance
3. **Grow intentionally** — gaps drive design, not arbitrary collection
4. **One source of truth** — palette CSS, single dictionary index
5. **Composable abstraction** — primitives → poses → scenes
6. **Propagate changes** — update a primitive, all scenes refresh

---

## Future Extensions

- **Multi-domain dictionaries** — separate dictionaries for nature, urban, fantasy, etc.
- **Style variants** — same camel, different artistic styles (sagan vs. contento rendering)
- **Collaborative dictionary** — shared semantic library across projects
- **Ontology export** — dictionary as RDF/OWL for philosophical reasoning
- **Narrative generation** — LLM generates stories from dictionary relationships
- **Animation** — poses as keyframes, compose animations from primitives
