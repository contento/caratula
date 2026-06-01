import { describe, it, expect } from "vitest";
import { buildPrompt, SYSTEM_PROMPT } from "./prompt.js";
import { BW } from "./palettes.js";
import { DEFAULT_CONSTRAINTS } from "./constraints.js";
import type { GenerationRequest } from "./types.js";
import { DEFAULT_CONCEPTS } from "./test-ontology.js";

const req = (over: Partial<GenerationRequest> = {}): GenerationRequest => ({
  tags: [DEFAULT_CONCEPTS.star, DEFAULT_CONCEPTS.water],
  palette: BW,
  constraints: DEFAULT_CONSTRAINTS,
  params: { model: "m", temperature: 0.5, seed: 1 },
  ...over,
});

describe("buildPrompt", () => {
  it("includes the concept tags", () => {
    const p = buildPrompt(req());
    expect(p).toContain(DEFAULT_CONCEPTS.star);
    expect(p).toContain(DEFAULT_CONCEPTS.water);
  });

  it("lists every palette color verbatim", () => {
    const p = buildPrompt(req());
    for (const c of BW.colors) expect(p).toContain(c);
  });

  it("states the canvas size and allowed primitives", () => {
    const p = buildPrompt(req());
    expect(p).toContain("512x512");
    expect(p).toContain("path");
  });

  it("forbids text when maxTextElements is 0", () => {
    const p = buildPrompt(req({ constraints: { ...DEFAULT_CONSTRAINTS, maxTextElements: 0 } }));
    expect(p).toContain("No text at all");
  });

  it("allows a labelled count when text is permitted", () => {
    const p = buildPrompt(req({ constraints: { ...DEFAULT_CONSTRAINTS, maxTextElements: 2 } }));
    expect(p).toMatch(/At most 2 short text label/);
  });

  it("demands raw SVG only", () => {
    expect(buildPrompt(req())).toMatch(/raw SVG only/i);
  });

  it("is deterministic", () => {
    expect(buildPrompt(req())).toBe(buildPrompt(req()));
  });
});

describe("SYSTEM_PROMPT", () => {
  it("encodes the minimalism goal and raw-SVG contract", () => {
    expect(SYSTEM_PROMPT).toMatch(/simplest\s+possible/i);
    expect(SYSTEM_PROMPT).toMatch(/raw SVG/i);
  });
});
