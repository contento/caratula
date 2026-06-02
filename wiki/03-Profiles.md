# Image Generation Profiles

Seven aesthetic styles, each with distinct constraints and prompt tone. **All profiles enforce ZERO text elements.**

| Profile | Aesthetic | Palette | Max Elements | Shapes | Use Case |
| --- | --- | --- | --- | --- | --- |
| **sagan** | Voyager Golden Record | Gold + Silver | 48 | Fundamental only | Cosmic, profound, archival |
| **picasso** | Single-line drawings | B/W | 20 | Fundamental only | Sophisticated, minimal, elegant |
| **contento** | Rich, dense, layered | 256-color | 80 | All shapes + effects | Visual abundance, complexity |
| **dictionary** | Vocabulary & icons | 256-color | 60 | All shapes + effects | Semantic visual library |
| **freud** *(future)* | Layers of the psyche | Grayscale + sepia | 50–70 | All shapes | Unconscious drives, dream logic |
| **jung** *(future)* | Archetypal symbols | 256-color | 50 | All shapes | Psychological/symbolic depth |
| **nietzsche** *(future)* | Full ontology-driven | 256-color | Variable | All shapes | Philosophical/conceptual mapping |

## Per-Profile Details

### sagan (implemented)

**Aesthetic:** Voyager Golden Record. Gold background (#d4af37), silver text/lines (#c0c0c0).

Voyager record plate aesthetic: technical, minimal, profound. The canonical reference for cosmic communication — a message to an alien civilization.

**Palette:** Gold + Silver (2 colors). Hard constraint.

**Max elements:** 48

**Prompt tone:** Archival, scientific, timeless. Imagine a diagram on a phonograph record that's traveled 50 years through space.

### picasso (implemented)

**Aesthetic:** Elegant, sophisticated lines. Minimal shapes. Single-line drawing style.

**Palette:** B/W (black on white).

**Max elements:** 20. Sparse; elegance through restraint.

**Prompt tone:** Minimalist, sophisticated, single-stroke. Think Picasso's line drawings — economical and perfect.

### contento (implemented)

**Aesthetic:** Less restrained. Rich complexity, 80+ elements, all shapes allowed. Dense, layered, visually abundant.

**Palette:** 256-color (full semantic palette).

**Max elements:** 80.

**Prompt tone:** Visual abundance. All SVG shapes permitted: paths, polygons, circles, groups, gradients, patterns, effects.

**Use case:** When you want to showcase the full range of visual possibility.

### dictionary (implemented)

**Aesthetic:** Dictionary-based generation. Uses visual vocabulary and pattern library.

**Palette:** 256-color.

**Max elements:** 60.

**Prompt tone:** Vocabulary-centric. Compose scenes from reusable semantic primitives. See [[design/Dictionary Profile]] for the full vision.

### freud (in development)

**Aesthetic:** Layers of the psyche. Grayscale + sepia, concentric structures for id/ego/superego.

**Palette:** Grayscale + Sepia (warm + cool tones).

**Max elements:** 50–70.

**Prompt tone:** Dream-like, introspective. Symbolic representation of unconscious drives, layered consciousness.

**Vision:** Concentric layers representing the id (innermost), ego (middle), superego (outer). Visual metaphors for defense mechanisms, complexes, and psychological concepts.

### jung (in development)

**Aesthetic:** Archetypal symbols. Psychological/symbolic depth (shadow, anima, self, hero).

**Palette:** 256-color.

**Max elements:** 50.

**Prompt tone:** Archetypal, symbolic. Each image embodies Jungian archetypes — the Hero, the Shadow, the Wise Old Man, the Anima/Animus, the Self.

### nietzsche (in development)

**Aesthetic:** Full ontology-driven. Philosophical/conceptual mapping via concept hierarchies.

**Palette:** 256-color.

**Max elements:** Variable.

**Prompt tone:** Philosophical, conceptual. Concepts map to visual hierarchies: the Apollonian vs. Dionysian, eternal recurrence, the Übermensch.

## Configuration

**Via `caratulai.config.yaml`:**
```yaml
generation:
  profile: sagan  # or picasso, contento, dictionary, ...
```

**Via CLI:**
```sh
node packages/cli/dist/index.js generate star water --profile sagan --out out/idea.svg
```

## See Also

- [[02-Principles]] — the 7 hard aesthetic constraints all profiles enforce
- [[04-Stack]] — the generation pipeline and how profiles shape prompts
