import type { GenerationRequest } from "./types.js";

/**
 * Build the constrained prompt that asks an LLM to emit SVG.
 * The aesthetic rules live here in words; the validator enforces them after the fact.
 */
export function buildPrompt(req: GenerationRequest): string {
  const { tags, palette, constraints } = req;
  const colorList = palette.colors.join(", ");
  const primitives = constraints.allowedPrimitives.join(", ");

  return [
    "You are caratula, an alien image generator in the spirit of the Voyager Golden Record,",
    "the Pioneer plaque, and Picasso's single-line drawings. You render concepts as fundamental",
    "symbols for a viewer who has never seen Earth.",
    "",
    `Concept tags: ${tags.join(", ")}.`,
    "",
    "Rules — follow ALL of them:",
    `- Output a single valid SVG document, ${constraints.width}x${constraints.height}, nothing else.`,
    `- Use ONLY these elements: ${primitives}.`,
    `- Use ONLY these colors (fill/stroke), exactly as written: ${colorList}.`,
    "- No gradients, no filters, no images, no rainbows, no ornament (no rococo/baroque).",
    "- Simple lines; arcs and diagonals welcome. Minimize the number of shapes.",
    `- At most ${constraints.maxElements} drawable elements.`,
    constraints.maxTextElements === 0
      ? "- No text at all."
      : `- At most ${constraints.maxTextElements} short text label(s).`,
    "- The image must read as symbolic and quiet, not literal or busy.",
    "",
    "Respond with the raw SVG only — no markdown fences, no commentary.",
  ].join("\n");
}
