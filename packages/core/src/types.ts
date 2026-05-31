/**
 * Core domain types for caratula.
 *
 * The engine is I/O-agnostic: it turns tags + palette + constraints into validated SVG.
 * Surfaces (cli/web/desktop/server) own persistence and inject providers.
 */

/** Kinds of fundamental palette. No rainbows — restrained hue by design. */
export type PaletteKind = "bw" | "grayscale" | "sepia" | "palette-16" | "palette-256";

/** A fundamental palette: an ordered list of hex colors output is snapped to. */
export interface Palette {
  id: string;
  kind: PaletteKind;
  /** Hex colors, e.g. "#000000". `background` is colors[0] by convention. */
  colors: string[];
  label?: string;
}

/** An ontology node — a simple concept, not a narrative. */
export interface Concept {
  id: string;
  label: string;
  /** Parent concept ids (taxonomy). */
  parents?: string[];
  /** Free-form relations to other concepts: relation -> concept ids. */
  relations?: Record<string, string[]>;
  synonyms?: string[];
}

/** Aesthetic constraints enforced by the validator (see validate.ts). */
export interface Constraints {
  /** SVG elements allowed in output. */
  allowedPrimitives: string[];
  /** Maximum number of drawable elements (complexity cap). */
  maxElements: number;
  /** Allow at most this many <text> elements (0 = none). */
  maxTextElements: number;
  /** Canvas size for the generated SVG. */
  width: number;
  height: number;
}

/** Knobs swept by the variation engine. */
export interface GenerationParams {
  model: string;
  temperature: number;
  seed?: number;
}

/** A single generation request. */
export interface GenerationRequest {
  tags: string[];
  palette: Palette;
  constraints: Constraints;
  params: GenerationParams;
}

/** Result of a generation: the SVG plus everything needed to reproduce it. */
export interface GenerationResult {
  svg: string;
  request: GenerationRequest;
  prompt: string;
  /** Issues found and fixed by the validator. */
  report: ValidationReport;
}

export interface ValidationIssue {
  rule: string;
  message: string;
  fixed: boolean;
}

export interface ValidationReport {
  ok: boolean;
  issues: ValidationIssue[];
}

/** A pluggable LLM backend (local or remote). */
export interface LLMProvider {
  readonly name: string;
  /** Models this provider can serve, cheapest first (ladder order). */
  readonly models: string[];
  /** Generate raw SVG text for a built prompt. */
  generateSvg(prompt: string, params: GenerationParams): Promise<string>;
}
