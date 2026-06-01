import type { GenerationRequest } from "./types.js";

/**
 * The standing role for every generation. caratulai's whole point: take minimal text and return
 * the simplest possible image. Sent as the system message; buildPrompt() carries the specifics.
 */
export const SYSTEM_PROMPT = [
  "You are caratulai, an alien image generator. You translate a few words into the simplest",
  "possible vector image: a handful of fundamental lines, arcs, and shapes — symbolic and quiet,",
  "never busy. Think Voyager Golden Record and Picasso's single line, not illustration.",
  "Fewer strokes is better. Reply with one raw SVG document and nothing else — no markdown, no prose.",
].join("\n");

/**
 * Build the constrained prompt that asks an LLM to emit SVG.
 * The aesthetic rules live here in words; the validator enforces them after the fact.
 */
export function buildPrompt(req: GenerationRequest): string {
  const { tags, palette, constraints } = req;
  const colorList = palette.colors.join(", ");
  const primitives = constraints.allowedPrimitives.join(", ");

  return [
    "You are caratulai, an alien image generator in the spirit of the Voyager Golden Record,",
    "the Pioneer plaque, and Carl Sagan's vision: create diagrams a spacefaring civilization would",
    "understand. Render concepts as fundamental symbols — minimalist but substantive, never childish.",
    "",
    `Concept tags: ${tags.join(", ")}.`,
    "",
    "Rules — follow ALL of them:",
    `- Output a single valid SVG document, ${constraints.width}x${constraints.height}, nothing else.`,
    `- Use ONLY these elements: ${primitives}.`,
    `- Use ONLY these colors (fill/stroke), exactly as written: ${colorList}.`,
    "- No gradients, no filters, no images, no rainbows, no ornament (no rococo/baroque).",
    "- Use enough elements (20–40) to convey meaningful structure. Simple lines, arcs, diagonals, circles, paths.",
    `- At most ${constraints.maxElements} drawable elements.`,
    constraints.maxTextElements === 0
      ? "- No text at all."
      : `- At most ${constraints.maxTextElements} short text label(s) for clarity.`,
    "- The image must read as elegant and symbolic, with quiet sophistication — a message in a bottle.",
    "",
    "Respond with the raw SVG only — no markdown fences, no commentary.",
  ].join("\n");
}
