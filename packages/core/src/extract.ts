import type { LLMProvider, GenerationParams } from "./types.js";
import { ModelLadder } from "./providers/index.js";

/**
 * System prompt for ontology extraction: ask the LLM to reduce narrative text
 * to a minimal set of visual concepts (tags). Emphasize simplicity and visual-only concepts.
 */
export const EXTRACTION_SYSTEM_PROMPT = [
  "You are caratulai's ontology extractor. Your job: read prose and extract 4–8 simple",
  "visual concepts (tags) that a minimalist image generator could draw. Think Voyager,",
  "Picasso's line. Extract ONLY visual things — no adjectives, no emotions, no narrative.",
  "Example: 'A dark journey across an ancient ocean' → star, water, ship, horizon.",
].join("\n");

/**
 * Build the extraction prompt that asks an LLM to emit a list of concept tags from text.
 */
export function buildExtractionPrompt(text: string): string {
  return [
    "You are caratulai's ontology extractor. Extract the core visual concepts from this text.",
    "Return ONLY a comma-separated list of tags (4–8 words). No explanation, no markdown.",
    "",
    `Text: "${text}"`,
    "",
    "Tags (comma-separated):",
  ].join("\n");
}

/**
 * Extract concept tags from narrative text using an LLM.
 * The LLM is asked to return a comma-separated (or newline-separated) list of tags.
 * Result is lowercased, trimmed, and filtered.
 */
export async function extractTags(
  text: string,
  provider: LLMProvider | ModelLadder,
  params?: Partial<GenerationParams>
): Promise<string[]> {
  const prompt = buildExtractionPrompt(text);

  // Use a lower temperature for extraction (more deterministic).
  const extractParams = {
    model: params?.model || "default",
    temperature: params?.temperature ?? 0.2,
    seed: params?.seed,
  };

  const raw = await provider.generateSvg(prompt, extractParams);

  // Parse the response as either comma-separated or newline-separated tags.
  // Try comma first, fall back to newline.
  let tags: string[];
  if (raw.includes(",")) {
    tags = raw.split(",").map((t) => t.trim().toLowerCase()).filter((t) => t.length > 0);
  } else {
    tags = raw
      .split("\n")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);
  }

  return tags;
}
