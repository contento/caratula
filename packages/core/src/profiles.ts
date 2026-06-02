import type { ProfileId } from "./types.js";

/**
 * A profile defines a complete aesthetic: palette, constraints, and prompt tone.
 */
export interface ProfileDef {
  id: ProfileId;
  label: string;
  paletteId: string;
  maxElements: number;
  maxTextElements: number;
  allowAllShapes: boolean;
  /** Profile-specific opening tone for buildPrompt(). */
  promptTone: string;
}

export const PROFILES: Record<ProfileId, ProfileDef> = {
  sagan: {
    id: "sagan",
    label: "Voyager Golden Record",
    paletteId: "sagan",
    maxElements: 48,
    maxTextElements: 0,
    allowAllShapes: false,
    promptTone: [
      "Create an engraved technical diagram in the style of the Voyager Golden Record plate.",
      "Gold background, silver lines and marks. Precise, scientific, timeless.",
      "Like a message from Earth engraved in metal for a civilization a thousand years from now.",
      "Technical, profound, archival.",
    ].join(" "),
  },

  picasso: {
    id: "picasso",
    label: "Picasso Single Line",
    paletteId: "bw",
    maxElements: 20,
    maxTextElements: 0,
    allowAllShapes: false,
    promptTone: [
      "Create in the style of Picasso's single-line drawings: continuous, elegant, unbroken lines.",
      "One flowing stroke suggests the entire form. Minimal, sophisticated, expressive.",
      "A sketch that reveals the essence, not the detail. Pure line, no fill.",
    ].join(" "),
  },

  contento: {
    id: "contento",
    label: "Rich Complexity",
    paletteId: "palette-256",
    maxElements: 80,
    maxTextElements: 0,
    allowAllShapes: true,
    promptTone: [
      "Create a rich, dense, layered composition with maximum visual complexity.",
      "Use all available SVG shapes, gradients, patterns, effects. Fill the canvas.",
      "Layer and overlap. No restrictions. Maximalist but coherent — abundance, not chaos.",
      "CRITICAL: ZERO TEXT. No <text> elements at all. Meaning comes from pure visual structure.",
    ].join(" "),
  },

  dictionary: {
    id: "dictionary",
    label: "Visual Dictionary",
    paletteId: "palette-256",
    maxElements: 60,
    maxTextElements: 0,
    allowAllShapes: true,
    promptTone: [
      "Create using a visual dictionary of archetypal symbols and icons.",
      "Each concept maps to a recognizable visual primitive. Combine icons into a coherent",
      "pictographic composition. Clear, referential, encyclopedic.",
    ].join(" "),
  },
};

export const DEFAULT_PROFILE: ProfileId = "sagan";

export function getProfile(id?: ProfileId): ProfileDef {
  return PROFILES[id ?? DEFAULT_PROFILE];
}
