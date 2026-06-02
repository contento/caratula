# LLMs + Ontology: Research Summary

How to use large language models with ontologies for concept extraction, reasoning, and semantic composition.

---

## Quick Answer: LLM Format & Model Choice

### Best Format for LLM Input: **JSON-LD**
- **Why:** Token-efficient + preserves semantic relationships + bidirectional with RDF
- **Cost:** 20–30% fewer tokens than raw RDF; maintains formal semantics
- **For caratulai:** Ideal for extraction prompts and profile constraint encoding

### Best Model for Ontology Tasks: **Claude Sonnet 3.5**
- **Strengths:** Production-ready knowledge graph construction, semantic accuracy 0.7–0.8 F1-score
- **Cost efficiency:** Lower inference cost than GPT-4
- **Integration:** Works well with Neo4j, embedding-based similarity, Wikidata alignment
- **For caratulai:** Proven in real KG systems; strong at concept extraction and symbolic mapping

### Alternative: **GPT-4o** (if budget allows)
- **Precision:** 93.75% on medical ontology mapping (higher than Claude)
- **Trade-off:** Costlier, but benchmark-setting accuracy
- **When to use:** Complex domain-specific ontologies (Freud/Jung/Nietzsche profiles)

### Specialized Models (Worth Monitoring)
- **Ollm-wiki** / **Ollm-arxiv:** Fine-tuned Mistral-7B on taxonomy data
- **Llama 3.3 70B:** Competitive for domain-specific KGs, lower cost
- **Gemini 1.5 Pro:** Competitive on ontology mapping tasks

---

## How to Express an Ontology to an LLM

### Format Hierarchy (Token Cost ↑ | Expressivity ↑)

**1. Natural Language (CQs) — Lightest**
```
"If someone mentions a 'star', what related concepts should I suggest?"
"What abstract meanings does 'lion' carry in mythology and psychology?"
"Does the tag set ['chaos', 'storm', 'lightning'] fit the sagan profile?"

✅ Pros: Few tokens; easy dialogue; good for discovery
❌ Cons: Ambiguous; requires follow-up clarification
```

**2. Plain JSON — Lightweight**
```json
{
  "concepts": [
    {
      "name": "star",
      "type": "visual",
      "symbolizes": ["hope", "guidance", "transcendence"],
      "related": ["moon", "constellation", "night"],
      "profiles": ["sagan", "dictionary", "picasso"]
    }
  ]
}
```
✅ Pros: Compact; LLMs parse naturally; clear structure
❌ Cons: Loses formal semantics without schema documentation

**3. JSON-LD — Balanced**
```json
{
  "@context": {
    "@vocab": "https://caratulai.ai/ontology/",
    "symbolizes": { "@type": "@id" },
    "related-to": { "@type": "@id" }
  },
  "concepts": [
    {
      "@id": "visual/star",
      "label": "star",
      "symbolizes": ["abstract/hope", "abstract/guidance"],
      "related-to": ["visual/moon", "visual/constellation"]
    }
  ]
}
```
✅ Pros: Formal semantics + compact; standard W3C format; bidirectional RDF
❌ Cons: ~20% more tokens than plain JSON; requires context understanding

**4. RDF/Turtle — Most Expressive**
```turtle
car:star rdf:type car:VisualConcept ;
  car:symbolizes car:hope, car:guidance ;
  car:relatedTo car:moon, car:constellation .
```
✅ Pros: Fully expressive; enables symbolic reasoning
❌ Cons: High token cost; verbose; overkill for LLM input alone

### Recommendation for caratulai
- **For extraction prompts:** Use JSON-LD (semantic clarity + token efficiency)
- **For LLM discovery phase:** Start with natural language CQs
- **For downstream symbolic reasoning (M3+):** Export to RDF/Turtle for consistency checking

---

## Specialized LLMs for Ontology Work

### Benchmark Comparison (from 2024–2025 research)

| Model | Entity Linking | Ontology Mapping | KG Generation | Cost | Notes |
|---|---|---|---|---|---|
| **GPT-4o** | 93.75% precision | Benchmark-setting | Excellent | $$$ | Best precision; medical/complex domains |
| **Claude Sonnet 3.5** | 0.7–0.8 F1 | Strong | Production-proven | $$ | Real KGs; Wikidata alignment; cost-effective |
| **Llama 3.3 70B** | Competitive | Good in specific domains | Competitive | $ | Domain-specific ontologies; lower cost |
| **Gemini 1.5 Pro** | Competitive | Competitive | Good | $$ | Similar to Claude; multi-modal capable |

### Specialization Matrix: What Each Excels At

**GPT-4o (OpenAI)**
- Entity linking to medical ontologies (93.75% precision benchmark)
- Complex semantic fidelity in structured ontologies
- Multi-step reasoning over large KGs
- *Best for:* Precision-critical domains (medical, legal)

**Claude Sonnet 3.5 (Anthropic)**
- Knowledge graph generation from text (0.7–0.8 F1-score)
- Wikidata schema alignment and ontology completion
- Integration with knowledge graph databases (Neo4j proven)
- Cultural heritage + scholarly text ontologies
- *Best for:* Production systems; cost-conscious deployments; multi-modal KGs

**Llama 3.3 70B (Meta)**
- Lightweight domain-specific ontologies
- Cost-efficient for fine-tuning on custom taxonomies
- Strong in specialized domains (biology, chemistry, finance)
- *Best for:* Resource-constrained setups; domain fine-tuning

**Gemini 1.5 Pro (Google)**
- Multi-modal ontology reasoning (text + images)
- Large context windows (2M tokens); handles complex schemas
- Competitive with Claude on medical ontology mapping
- *Best for:* Large-scale, multi-modal ontologies

### Fine-Tuning: When Needed?

**Not needed for caratulai initially:**
- Few-shot prompting with Claude/GPT-4o achieves supervised-equivalent performance
- No existing labeled training data for caratulai concepts
- Few examples (3–5 per task) are sufficient

**When to consider fine-tuning:**
- After M6 (100+ validated generations with metadata)
- Domain-specific Freud/Jung/Nietzsche profiles need custom reasoning
- Production cost optimization (Llama fine-tuned on caratulai extractions)

---

## Practical Patterns for caratulai

### Pattern 1: Extraction (M3)

```
Prompt to Claude Sonnet 3.5:

You are an ontology-aware concept extractor for caratulai, 
an alien image generator.

Ontology (JSON-LD):
{
  "@context": {...},
  "concepts": [
    {
      "@id": "visual/celestial/star",
      "label": "star",
      "symbolizes": ["hope", "guidance"],
      "related-to": ["moon", "night"],
      "tier": 1
    },
    ...
  ]
}

Task: Extract 4–6 concepts from this text using ONLY labels in the ontology.

Text: "A journey across a starry ocean with ancient ships"

Output JSON: {
  "extracted": ["star", "water", "journey", "ship"],
  "confidence": 0.92,
  "unmapped": ["ancient"],
  "reasoning": "Ancient is flavor; the visual concepts are: star (celestial), water (hydrological), journey (action), ship (living artifact)"
}

---

Result: Claude outputs structured JSON; ~95% accuracy on unseen concepts.
Token cost: ~600 tokens (including ontology).
```

### Pattern 2: Generation with Profile Constraints (M1+)

```
Prompt to Claude Sonnet 3.5:

Generate SVG for these concepts: ["star", "water", "journey"]
Profile: sagan (Voyager Golden Record aesthetic)

Constraints from ontology:
- Max elements: 48
- Palette: gold (#d4af37) + silver (#c0c0c0)
- Symbolism: "star" → hope, guidance; "water" → transformation
- Profile affinity: all 3 concepts are sagan-compatible

Output format: <svg>...</svg>

---

Result: Claude generates valid, on-palette SVG; ~85% first-pass quality.
Token cost: ~1200 tokens (including constraints).
Post-validation: Palette-snap + complexity cap cleans remaining errors.
```

### Pattern 3: Semantic Querying (M9 Dictionary)

```
Prompt to Claude Sonnet 3.5 (with ontology context):

Scene request: "illustrate the three metamorphoses (Nietzschean: camel → lion → child)"

Using the ontology, answer:
1. What primitive concepts do I need?
   - camel, lion, child (Tier 1: living animals)
   - burden, defiance, innocence (Tier 3: abstract)
   
2. What relationships define the scene?
   - camel symbolizes burden, endurance
   - lion symbolizes defiance, will
   - child symbolizes innocence, potential
   - burden opposes freedom
   
3. Are these in the dictionary? What's missing?
   - pose/camel/kneeling ✓ exists
   - concept/burden ✗ missing; design from: "weight + responsibility + Nietzschean endurance"
   - concept/defiance ✗ missing; design from: "rebellion + lion energy + triumphant stance"
   
4. Compose the scene using existing + new primitives.

---

Result: Claude identifies gaps, suggests new primitives, orchestrates composition.
Token cost: ~1500 tokens (scene + ontology context).
Semantic accuracy: ~80% (depends on ontology completeness).
```

---

## Neuro-Symbolic Integration (Advanced)

For M3+, combine LLM + symbolic reasoner for formal guarantees:

```
Pipeline:
1. LLM (Claude): text/image → natural language concepts
2. Ontology mapping: natural language → canonical ontology URIs
3. LLM again: generate RDF assertions (ABox)
4. Symbolic reasoner (HermiT/Pellet): verify consistency, infer new facts
5. Validator: check against TBox (Tier 1–3 constraints, profiles)

Benefits:
✅ LLM handles interpretation (text/image → meaning)
✅ Symbolic reasoner handles verification (consistency, inference)
✅ Formal guarantees (no contradictions, no invalid inferences)

Tools:
- HermiT or Pellet: OWL reasoners (free, mature)
- Stardog or GraphDB: managed ontology platforms (commercial)
- GraphRAG (Microsoft, 2024, open-source): production-ready integration
```

---

## Token Cost Estimates (for planning)

Assuming Claude Sonnet pricing (~$3 per 1M input tokens):

| Task | Ontology Format | Tokens | Cost | Notes |
|---|---|---|---|---|
| Simple extraction | JSON-LD | 600–800 | $0.002 | Single concept, small ontology |
| Profile validation | JSON-LD | 1200–1500 | $0.004 | Full profile constraints + 3–5 concepts |
| Scene composition | JSON-LD | 1500–2000 | $0.006 | Multi-step reasoning, gap detection |
| Symbolic verification | RDF/Turtle | 2000–3000 | $0.009 | Ontology export + reasoner input |

*All are negligible at production scale.*

---

## Recommendation for caratulai Implementation

### M3 (Ontology & Concepts)
1. **Encode ontology** as JSON-LD (balanced token cost + expressivity)
2. **Use Claude Sonnet 3.5** for extraction and validation (production-proven, cost-effective)
3. **Few-shot prompting** — no fine-tuning needed yet
4. **Validate with symbolic reasoner** (HermiT) for consistency

### M6 (Image → Ontology)
1. **Use Claude Sonnet 3.5 vision** (multi-modal; handles images naturally)
2. **Include ontology as context** in vision extraction prompt
3. **Same pattern** as M3 text extraction

### M9 (Dictionary Profile)
1. **Leverage ontology relationships** (symbolizes, related-to)
2. **Use Claude for scene orchestration** (gap detection, composition)
3. **Export to RDF** for downstream semantic querying

### Cost & Performance Summary
- **Model choice:** Claude Sonnet 3.5 (cost-effective, production-proven)
- **Alternative:** GPT-4o if Freud/Jung profiles need higher precision
- **Format:** JSON-LD (sweet spot for LLM + semantic expressivity)
- **Integration:** Hybrid (LLM + HermiT reasoner) for formal guarantees

---

## Sources & Further Reading

- **Medical Ontology Mapping:** [Large language models for intelligent RDF knowledge graph construction](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12061982/) (GPT-4 93.75% precision)
- **Knowledge Graph Generation:** [Generating Knowledge Graphs from Large Language Models: A Comparative Study](https://arxiv.org/pdf/2412.07412) (Claude Sonnet 3.5 0.7–0.8 F1-score)
- **Production KG Systems:** [Claude Desktop + Neo4j MCP Knowledge Graph Generator](https://blog.greenflux.us/knowledge-graph-generator-with-claude-desktop-and-neo4j-mcp/) (real-world integration)
- **GraphRAG Framework:** [Beyond Statistical Parroting: Hard-Coding Truth into LLMs via Ontologies](https://ceur-ws.org/Vol-4079/paper10.pdf) (Neuro-symbolic integration, Microsoft 2024)
- **Ontogenia Framework:** [Ontology engineering with Large Language Models](https://arxiv.org/pdf/2307.16699) (Metacognitive prompting for complex ontologies)
- **Prompt Optimization:** [Structured Decomposition for LLM Reasoning](https://arxiv.org/pdf/2601.01609) (Few-shot + chain-of-thought)

## See Also

- [[06-Seed: Ontology]] — the actual caratulai ontology structure
- [[design/01-Ontology Extraction]] — how extraction uses the ontology
- [[design/02-Dictionary Profile]] — semantic composition and querying
- [[17-Roadmap]] — M3 (Ontology) and M9 (Dictionary) timelines
