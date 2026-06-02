# Seed Ontology for caratulai

A foundational concept taxonomy to drive extraction, generation, and semantic composition. This ontology defines:
- **Core visual concepts** — things you can draw (star, water, mountain)
- **Abstract concepts** — meanings and feelings (journey, burden, defiance)
- **Relationships** — how concepts relate (is-a, symbolizes, opposes, related-to)

This document evolves through **M3 (Ontology & concepts)** and informs **M9 (Dictionary profile)**.

---

## Competency Questions (Scope Definition)

These frame what the ontology should answer:

1. **Visual Extraction:** "Given a photograph, what 4–6 core visual concepts should I extract?"
2. **Semantic Enrichment:** "If the user says 'star', what related concepts should I suggest?" (celestial, light, night, hope)
3. **Concept Disambiguation:** "The user says 'tree'. Is that a botanical tree, a tree in the graph-theory sense, or a genealogical tree?"
4. **Symbolic Mapping:** "What abstract concepts does 'lion' symbolize?" (courage, defiance, nobility, predation)
5. **Profile Consistency:** "Does this tag set fit the sagan profile? (minimal, archival)" vs. "Does it fit contento? (dense, abundant)"

---

## Conceptual Tiers

### Tier 1: Fundamental Visuals (Drawable)
Things you directly represent as SVG primitives.

```
Visual Concepts
├── Celestial
│   ├── star
│   ├── moon
│   ├── sun
│   └── constellation
├── Hydrological
│   ├── water
│   ├── ocean
│   ├── river
│   └── cloud
├── Terrestrial
│   ├── mountain
│   ├── desert
│   ├── forest
│   └── field
├── Living (Animals)
│   ├── dog
│   ├── cat
│   ├── lion
│   ├── bird
│   └── human
└── Abstract Shapes
    ├── line
    ├── circle
    ├── spiral
    └── labyrinth
```

### Tier 2: Actions & States
How things relate or behave.

```
Action/State Concepts
├── Motion
│   ├── walking
│   ├── running
│   ├── flying
│   └── traveling
├── Posture
│   ├── sitting
│   ├── standing
│   ├── kneeling
│   └── resting
├── Emotion/Mood
│   ├── calm
│   ├── chaotic
│   ├── contemplative
│   └── energetic
└── Relationship
    ├── solitude
    ├── companionship
    ├── conflict
    └── harmony
```

### Tier 3: Abstract / Philosophical
Meanings and archetypal resonances.

```
Abstract Concepts
├── Jungian Archetypes
│   ├── hero
│   ├── shadow
│   ├── wise-old-man
│   ├── innocent
│   └── lover
├── Philosophical
│   ├── burden
│   ├── freedom
│   ├── transcendence
│   └── void
├── Emotional/Spiritual
│   ├── hope
│   ├── despair
│   ├── wonder
│   └── dread
└── Mythological
    ├── transformation
    ├── quest
    ├── sacrifice
    └── rebirth
```

---

## Relationship Types

### is-a (Type Hierarchy)
```
star is-a celestial
dog is-a living-animal
sagan is-a generation-profile
```

### part-of (Composition)
```
mountain-peak part-of mountain
desert-dune part-of desert
lion-mane part-of lion
```

### symbolizes (Semantic Meaning)
```
star symbolizes hope
star symbolizes guidance
lion symbolizes courage
desert symbolizes solitude
journey symbolizes transformation
burden symbolizes responsibility
```

### related-to (Association)
```
star related-to night
water related-to reflection
mountain related-to ascent
dog related-to loyalty
```

### opposes (Antonymy)
```
light opposes darkness
chaos opposes order
solitude opposes companionship
ascent opposes descent
```

### profile-affinity (Generation Profile Fit)
```
star profile-affinity sagan
star profile-affinity dictionary
water profile-affinity picasso
desert profile-affinity contento
```

---

## JSON-LD Format (for LLM Input)

This format is token-efficient and preserves semantic precision:

```json
{
  "@context": {
    "@vocab": "https://caratulai.ai/ontology/",
    "is-a": { "@type": "@id" },
    "part-of": { "@type": "@id" },
    "symbolizes": { "@type": "@id" },
    "related-to": { "@type": "@id" },
    "opposes": { "@type": "@id" },
    "profile-affinity": { "@type": "@id" }
  },
  "concepts": [
    {
      "@id": "visual/celestial/star",
      "@type": "VisualConcept",
      "label": "star",
      "tier": 1,
      "description": "A luminous point in the night sky; symbol of hope and guidance",
      "is-a": "visual/celestial",
      "symbolizes": [
        "hope",
        "guidance",
        "transcendence",
        "destiny"
      ],
      "related-to": [
        "visual/celestial/moon",
        "visual/celestial/constellation",
        "state/emotion/wonder"
      ],
      "opposes": [
        "state/emotion/despair"
      ],
      "profile-affinity": [
        "sagan",
        "dictionary",
        "picasso"
      ],
      "drawable": true,
      "svg-examples": [
        { "shape": "circle", "size": "small", "fill": "gold" },
        { "shape": "polygon", "points": 5, "fill": "gold" }
      ]
    },
    {
      "@id": "visual/hydrological/water",
      "@type": "VisualConcept",
      "label": "water",
      "tier": 1,
      "is-a": "visual/hydrological",
      "symbolizes": [
        "reflection",
        "flow",
        "transformation",
        "emotion"
      ],
      "related-to": [
        "visual/hydrological/river",
        "visual/hydrological/ocean",
        "state/motion/flowing"
      ],
      "profile-affinity": [
        "contento",
        "dictionary",
        "picasso"
      ],
      "drawable": true,
      "svg-examples": [
        { "shape": "path", "style": "wavy" },
        { "shape": "circle", "style": "fluid" }
      ]
    },
    {
      "@id": "abstract/burden",
      "@type": "AbstractConcept",
      "label": "burden",
      "tier": 3,
      "description": "Weight, responsibility, endurance. Nietzschean: the camel bearing weight.",
      "symbolizes": [
        "responsibility",
        "duty",
        "endurance",
        "sacrifice"
      ],
      "related-to": [
        "visual/living-animal/camel",
        "abstract/freedom",
        "action/kneeling"
      ],
      "opposes": [
        "abstract/freedom",
        "abstract/lightness"
      ],
      "profile-affinity": [
        "freud",
        "jung",
        "nietzsche"
      ],
      "drawable": false,
      "freud-relevance": "id/ego/superego tension"
    }
  ]
}
```

---

## Natural Language Format (Conversational)

For initial discovery via LLM, use **competency questions** and narrative descriptions:

```
We're building an image generator that turns concept tags into simple vector art.

Core Visual Concepts (things you can draw):
- Celestial: star, moon, sun, constellation
- Water: ocean, river, water, cloud
- Land: mountain, desert, forest, field
- Animals: dog, cat, lion, bird, human
- Shapes: line, circle, spiral, labyrinth

Abstract Concepts (meanings & feelings):
- Jungian: hero, shadow, wise-old-man, innocent
- Philosophical: burden, freedom, transcendence, void
- Emotional: hope, despair, wonder, dread
- Mythological: transformation, quest, sacrifice, rebirth

Key Relationships:
- "star" symbolizes hope and guidance
- "lion" symbolizes courage and defiance
- "desert" symbolizes solitude
- "water" symbolizes transformation and reflection
- "burden" opposes freedom
- "lion" is related to "defiance"

Profile Affinities:
- "star" fits sagan (archival), dictionary (symbolic), and picasso (minimal)
- "water" fits contento (dense), dictionary, and picasso
- "burden" fits freud, jung, and nietzsche (psychological profiles)

Questions to explore:
1. If someone says "journey", what visual concepts should be extracted?
2. What abstract concepts does a "mountain" symbolize?
3. Does "chaos" fit the sagan profile or contento?
```

---

## RDF/Turtle Format (for Symbolic Reasoning)

For downstream reasoning systems (HermiT, Pellet), use Turtle:

```turtle
@prefix car:  <https://caratulai.ai/ontology/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .

# Classes
car:VisualConcept rdf:type rdfs:Class .
car:AbstractConcept rdf:type rdfs:Class .
car:GenerationProfile rdf:type rdfs:Class .

# Individuals and Properties
car:star rdf:type car:VisualConcept ;
  rdfs:label "star" ;
  car:symbolizes car:hope, car:guidance, car:transcendence ;
  car:relatedTo car:moon, car:constellation ;
  car:partOfProfile car:sagan, car:dictionary, car:picasso ;
  car:drawable true .

car:burden rdf:type car:AbstractConcept ;
  rdfs:label "burden" ;
  car:symbolizes car:responsibility, car:endurance, car:sacrifice ;
  car:opposes car:freedom ;
  car:relatedTo car:camel, car:nietzsche_philosophy .

# Profile Constraints
car:sagan car:prefersConcepts [ a rdf:Bag ;
  rdf:_1 car:star ;
  rdf:_2 car:moon ;
  rdf:_3 car:constellation ] ;
  car:maxElements 48 ;
  car:preferredPalette car:gold_silver .

car:contento car:prefersConcepts [ a rdf:Bag ;
  rdf:_1 car:water ;
  rdf:_2 car:forest ;
  rdf:_3 car:chaos ] ;
  car:maxElements 80 ;
  car:preferredPalette car:palette_256 .
```

---

## Phased Build-Out

### Phase 1 (M3): Foundation
- [ ] Define Tier 1 visual concepts (~30 core concepts)
- [ ] Define Tier 2 action/state concepts (~20 concepts)
- [ ] Define Tier 3 abstract concepts (~20 concepts)
- [ ] Map relationships (symbolizes, related-to, opposes, is-a, part-of)
- [ ] Encode in JSON-LD + RDF/Turtle

### Phase 2 (M3): Extraction & Validation
- [ ] LLM extractor: "Given a photo/text, extract Tier 1–3 concepts"
- [ ] Validator: "Is this concept in the ontology? Is it valid for this profile?"
- [ ] Canonical resolution: "star" + "celestial" → both map to `visual/celestial/star`

### Phase 3 (M6): Image → Ontology
- [ ] Vision extractor: "What visual concepts does this image contain?"
- [ ] Map to Tier 1 concepts (visual concreteness required)

### Phase 4 (M9): Dictionary Profile Semantic Querying
- [ ] Query by meaning: "Show me things that symbolize defiance"
- [ ] Relationship traversal: "What's related to lion?"
- [ ] Suggest reuse: "This concept already exists as..."

---

## Using This with LLMs

### For Extraction (M1–M3)
Include the JSON-LD in your prompt:

```
You are an ontology-aware concept extractor. 
Given this ontology:
[JSON-LD here]

And this image/text: [user input]

Extract 4–6 core concepts using ONLY labels from the ontology.
Output as JSON: { "concepts": ["concept1", "concept2", ...] }
```

### For Generation (M1+)
Include the profile affinity constraints:

```
Generate SVG for these concepts: ["star", "water", "journey"]
Using the sagan profile:
- Max 48 elements
- Palette: gold + silver only
- Must use concepts from: [list from ontology]
- Avoid: [opposes list]
- Emphasize symbolic meaning: [symbolizes list]
```

### For Dictionary Composition (M9)
Use semantic relationships:

```
Scene request: "illustrate the three metamorphoses"
Needed concepts from ontology:
- camel (Tier 1: living-animal)
  - symbolizes: burden, endurance
  - related-to: transformation, sacrifice
- burden (Tier 3: philosophical)
  - opposes: freedom
  - related-to: responsibility, duty

Using these relationships, compose a scene where...
```

---

## Next Steps

1. **Validate scope** — do these tiers cover caratulai's aesthetic?
2. **Add domain-specific concepts** — Freud (id/ego/superego), Jung (archetypes), Nietzsche (genealogy)
3. **Build extraction prompts** — test with Claude/Grok/Ollama
4. **Integrate into M3** — wire concept validation into the CLI
5. **Feed Dictionary Profile** — use symbolizes/related-to for semantic composition

## See Also

- [[08-Open Questions]] — question 6 (tag validation against ontology)
- [[design/01-Ontology Extraction]] — how extraction uses the ontology
- [[design/02-Dictionary Profile]] — M9 semantic querying
- [[17-Roadmap]] — M3 and M9 implementation timeline
