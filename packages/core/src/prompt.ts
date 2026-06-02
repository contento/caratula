import type { GenerationRequest } from "./types.js";
import { getProfile } from "./profiles.js";

/**
 * The standing role for every generation. caratulai's whole point: take minimal text and return
 * the simplest possible image. Sent as the system message; buildPrompt() carries the specifics.
 */
export const SYSTEM_PROMPT = [
  "You are caratulai, an alien image generator. You translate concepts (tags) into vector images.",
  "Reply with one raw SVG document and nothing else — no markdown, no prose.",
].join("\n");

/**
 * Build the constrained prompt that asks an LLM to emit SVG.
 * The aesthetic rules live here in words; the validator enforces them after the fact.
 * Profile-specific tone is injected into the opening.
 */
export function buildPrompt(req: GenerationRequest): string {
  const { tags, palette, constraints, profile } = req;
  const def = getProfile(profile);
  const colorList = palette.colors.join(", ");
  const primitives = constraints.allowedPrimitives.join(", ");

  return [
    def.promptTone,
    "",
    `Concept tags: ${tags.join(", ")}.`,
    "",
    "STRICT RULES:",
    `- Output valid SVG only: ${constraints.width}x${constraints.height}. No markdown, no text, no commentary.`,
    `- Elements: ${primitives}.`,
    `- Colors ONLY: ${colorList}. Exact hex values. No deviations.`,
    `- Maximum ${constraints.maxElements} elements. Use them meaningfully.`,
    constraints.maxTextElements === 0
      ? "- ZERO text. Meaning comes from visual structure alone."
      : `- At most ${constraints.maxTextElements} technical label(s).`,
    "",
    "Generate the SVG now:",
  ].join("\n");
}
