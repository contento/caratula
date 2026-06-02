# Principles

## The Seven Hard Aesthetic Constraints

These are **validation rules, not just guidance.** Every generated image must pass these constraints.

### 1. Tags, not stories
Core processing is an ontology of simple concepts, not prose prompts. When provided with an image or narrative text, the system extracts the ontology first before generating.

### 2. Vector first
SVG is the native output; raster/PDF are exports.

### 3. Fundamental palettes only
B/W, sepia, grayscale, 16-color, 256-color — always restrained. **No rainbows. No rococo. No baroque.**

Even at 16/256 colors, the palette is **fundamental and harmonious** — restrained hue, earth/primary tones only.

### 4. Simple lines
Arcs and diagonals welcome; complexity minimized. Primitives: `line`, `path` (arcs/diagonals/curves), `circle`, `polygon`. Minimal element count.

### 5. Little or no text
Text distracts. When needed, use sparingly — shapes convey meaning. **Default: zero text elements.**

### 6. Reproducible
Every image stores the tags, palette, model, and parameters that made it.

### 7. Simple chords
A small set of familiar elements, arranged for feeling — not complexity. The Beatles, not Berlioz.

## Validation Requirements

Generated images must pass the **validator/sanitizer**:

- **Palette-snap** — all colors snapped to the chosen palette
- **SVG well-formedness** — valid XML, allowed primitives only
- **Complexity cap** — element count limits per profile
- **Text stripping** — no text labels unless explicitly allowed per profile

## Design Philosophy

**Goal:** Voyager Golden Record aesthetic — sophisticated, substantive, symbolic, elegant. Think Carl Sagan's vision: diagrams a spacefaring civilization would understand. Dense with meaning, not simple.

**All SVG shapes encouraged** (where the profile allows): paths, circles, polygons, groups, gradients, patterns, effects, text paths.

**Default to LLM-generates-SVG**, not diffusion. Diffusion is an opt-in mode only.
