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
    "Generate a SOPHISTICATED TECHNICAL DIAGRAM in the style of circuit schematics, astronomical charts,",
    "and scientific notation. Think: Voyager Golden Record, technical blueprints, engineering diagrams.",
    `Render ${tags.join(", ")} as a COMPLEX, DENSE, MATURE visual: intricate, layered, technical-looking.`,
    "NEVER childish, simplistic, or cartoon-like. Aim for the sophistication of an engineering manual.",
    "",
    `Concept tags: ${tags.join(", ")}.`,
    "",
    "STRICT RULES:",
    `- Output valid SVG only: ${constraints.width}x${constraints.height}. No markdown, no text, no commentary.`,
    `- Elements: ${primitives}.`,
    `- Colors ONLY: ${colorList}. Exact hex values. No deviations.`,
    "- FORBIDDEN: gradients, filters, images, rainbows, ornament, anything decorative or childish.",
    `- USE ${constraints.maxElements} elements AGGRESSIVELY. Fill the canvas. Layer shapes densely.`,
    "- Create: overlapping polygons, nested groups, complex paths, repeating geometric patterns.",
    "- Aim for visual DENSITY and COMPLEXITY — technical, not playful. Intricate webs of lines and shapes.",
    "- Think: circuit board traces, star maps, molecular diagrams, geometric tessellations.",
    `- Maximum ${constraints.maxElements} elements — use 50+ if possible. More complexity = more sophisticated.`,
    constraints.maxTextElements === 0
      ? "- ZERO text. Meaning comes from visual structure alone."
      : `- At most ${constraints.maxTextElements} technical label(s).`,
    "- The result must look MATURE, TECHNICAL, and SUBSTANTIAL — not like a children's drawing.",
    "",
    "Generate the SVG now:",
  ].join("\n");
}
