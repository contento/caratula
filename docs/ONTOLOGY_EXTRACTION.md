# Ontology Extraction Pipeline

## Current State

The app currently accepts **tags directly** and generates SVG:

```
CLI: caratulai generate star water travel
  ↓
GenerationRequest { tags: ["star", "water", "travel"], palette, constraints, params }
  ↓
generate() → buildPrompt() → LLM → sanitizeSvg() → GenerationResult
```

This works for the **direct tag input** case (current CLI behavior).

## The Gap: Input Normalization

We've documented that "ontology should be at the root" — meaning **all inputs must be converted to an ontology** before generation. This applies to three input types:

### Input Types

1. **Direct tags** (current)
   - Input: `caratulai generate star water travel`
   - Extraction: none — pass through directly
   - Ontology: `["star", "water", "travel"]`

2. **Narrative text** (future)
   - Input: `caratulai generate --from-text "A journey across a starry ocean"`
   - Extraction: LLM or heuristic parser extracts core concepts
   - Ontology: `["star", "water", "travel", "journey"]` (extracted)

3. **Image input** (M6: Caratulize)
   - Input: `caratulai caratulize photo.jpg`
   - Extraction: vision model analyzes image, extracts visual concepts
   - Ontology: `["landscape", "mountain", "water"]` (extracted from image)

## Proposed Architecture

The **ontology extraction layer** sits between input acceptance and generation:

```
Input (tags | text | image)
  ↓
[EXTRACTION LAYER] ← should this be in core or surfaces?
  ├─ passthrough for tags
  ├─ text → LLM/parser → concepts
  └─ image → vision model → concepts
  ↓
Extracted ontology (concept tags)
  ↓
GenerationRequest { tags: [...], palette, constraints, params }
  ↓
generate() → buildPrompt() → LLM → sanitizeSvg()
  ↓
GenerationResult
```

## Design Question: Where Should Extraction Live?

### Option A: In `core` as a new module

```typescript
// packages/core/src/extract.ts
export async function extractOntologyFromText(
  text: string,
  provider: LLMProvider
): Promise<string[]>;

export async function extractOntologyFromImage(
  image: Buffer,
  provider: LLMProvider
): Promise<string[]>;

export function extractOntologyFromTags(tags: string[]): string[];
```

**Pros:**
- Reusable across all surfaces (CLI, web, desktop, server)
- Keeps extraction logic centralized
- Follows the principle: core = pure, surfaces = I/O

**Cons:**
- Core currently stays I/O-agnostic (no image handling)
- Adds dependencies (vision model support)
- Extraction is a different concern than generation

### Option B: In surfaces (CLI, web, desktop)

Each surface (CLI, web, desktop, server) implements its own extraction:

```typescript
// packages/cli/src/extract.ts
// reads files, calls core/providers for extraction
```

**Pros:**
- Keeps core lean and focused
- Surface-specific extraction (e.g., CLI reads files, web accepts drag-drop)
- Each surface owns its input formats

**Cons:**
- Duplication across surfaces
- Harder to test centrally
- Core doesn't have a unified ontology contract

## Recommendation: Hybrid Approach

1. **`core` owns the LLM-based extraction contracts** (ask an LLM to extract concepts from text):
   ```typescript
   // packages/core/src/extract.ts (pure, no I/O)
   export function buildExtractionPrompt(text: string): string;
   export async function extractConceptsFromText(
     text: string,
     provider: LLMProvider
   ): Promise<string[]>;
   ```

2. **Surfaces handle I/O and input validation**:
   - CLI: file I/O, command-line parsing
   - Web: file upload, drag-drop, base64 images
   - Desktop/Server: similar surface concerns

3. **For image → ontology (M6: Caratulize)**:
   - Reuse the same vision provider interface
   - `core` defines the vision extraction contract
   - Surfaces handle image input/validation

## Extraction Workflow Details

### Text Extraction

The LLM reduces narrative to a tag set:

```
Input: "A journey across a starry ocean with ancient ships"
↓
LLM prompt: "Extract 4-6 core visual concepts from this text, one per line."
↓
Output: "star\nwater\nship\njourney"
↓
Ontology: ["star", "water", "ship", "journey"]
```

**Key constraint:** extraction should be **conservative** — only extract concepts that will actually affect the visual result. "Ancient" is flavor; "ship" and "water" are visual.

### Image Extraction (M6)

Vision model reads the image and describes it in caratulai terms:

```
Input: photo.jpg
↓
Vision LLM: "Describe this image using only simple visual concepts (4-6 tags)"
↓
Output: "mountain\nwater\ncloud\nlight"
↓
Ontology: ["mountain", "water", "cloud", "light"]
```

## Phased Implementation

### Phase 1: Direct Tags (✅ Done)
- `caratulai generate star water travel`
- No extraction needed; pass through

### Phase 2: Text Input (ready for M1/M2)
- `caratulai generate --from-text "..."`
- Add `extractConceptsFromText()` to core
- Wire into CLI

### Phase 3: Image Input (M6: Caratulize)
- `caratulai caratulize image.jpg`
- Add vision provider interface
- Implement `extractConceptsFromImage()`

## Open Questions

1. **Extraction model:** use the same LLM provider as generation, or a cheaper model?
2. **Tag validation:** should extracted tags be validated against a known ontology (M3), or accepted freely?
3. **Ontology seeding (M3):** once we have a taxonomy, should extraction resolve synonyms and hierarchies?
4. **Caching:** should extraction results be cached (same text → same ontology)?

## Implementation Notes

- Extraction should be **fast and cheap** (use a cheap model ladder rung)
- Extraction prompts should enforce a **tag count limit** (e.g., 4-8 concepts max)
- Extraction should be **deterministic** if possible (seed, low temperature)
- Every extraction result should be **logged** (for reproducibility and debugging)
