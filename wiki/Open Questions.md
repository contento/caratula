# Open Questions

Living list of decisions pending. As each question is resolved, record the decision as an ADR.

## Resolved

1. ✅ **Stack direction** → **Resolved: all-TypeScript monorepo** ([[decisions/ADR-0002 TypeScript Monorepo|ADR 0002]]).
2. ✅ **Generation via LLM or diffusion** → **Resolved: LLM-generated SVG** ([[decisions/ADR-0001 LLM Generates SVG|ADR 0001]]).
3. ✅ **First surface to build** → **Resolved: core + CLI first.**
4. ✅ **Versioning policy** → **Resolved: lockstep SemVer, tag-driven** ([[decisions/ADR-0003 Versioning|ADR 0003]]).

## Pending

1. **Web framework:** SvelteKit vs React. *(deferred until web package starts, M5)*

2. **Default palette + first concepts:** which ontology seed do we start with?
   - Current: small vocabulary of fundamental concepts (star, water, travel, journey, etc.)
   - Future: formalize as a seed ontology in M3

3. **Local model baseline:** which Ollama model is the baseline for SVG (quality vs cost)?
   - Candidates: qwen2.5-coder, mistral, llama2
   - Measurement: SVG quality, generation speed on M1 Mac

4. **Palette enforcement:** strict color-snapping (guaranteed) vs prompt-only (looser)?
   - Current: post-process color-snap (strict)
   - Trade-off: guarantees correctness vs LLM quality/creativity

5. **Extraction model (M1–M2):** use the same LLM provider as generation, or a cheaper model?
   - Text/image → ontology extraction (M1–M6)
   - Cost optimization: chain cheap extraction model → expensive generation model

6. **Tag validation (M3):** should extracted tags be validated against a known ontology, or accepted freely?
   - Pros (validate): consistency, semantic correctness
   - Pros (free): flexibility, organic growth

7. **Ontology seeding (M3):** once we have a taxonomy, should extraction resolve synonyms and hierarchies?
   - Example: "star" + "celestial" → both map to the same concept

8. **Caching:** should extraction results be cached (same text → same ontology)?
   - Trade-off: reproducibility & speed vs freshness

## See Also

- [[Roadmap]] — milestones where these questions will be resolved
- [[decisions/ADR Index]] — all recorded decisions
