import { describe, it, expect } from "vitest";
import { generate, generateVariations } from "./generate.js";
import { BW, SEPIA } from "./palettes.js";
import { DEFAULT_CONSTRAINTS } from "./constraints.js";
import type { GenerationParams, GenerationRequest, LLMProvider } from "./types.js";

/** Records what it was asked and returns a fixed (messy) SVG. */
class RecordingProvider implements LLMProvider {
  readonly name = "rec";
  readonly models = ["rec-1"];
  readonly calls: { prompt: string; params: GenerationParams }[] = [];
  constructor(private readonly svg = '<svg><rect fill="#00ff88"/></svg>') {}
  async generateSvg(prompt: string, params: GenerationParams): Promise<string> {
    this.calls.push({ prompt, params });
    return this.svg;
  }
}

const req = (over: Partial<GenerationRequest> = {}): GenerationRequest => ({
  tags: ["moon"],
  palette: BW,
  constraints: DEFAULT_CONSTRAINTS,
  params: { model: "rec-1", temperature: 0.7, seed: 0 },
  ...over,
});

describe("generate", () => {
  it("runs the full pipeline and returns a validated result", async () => {
    const provider = new RecordingProvider();
    const result = await generate(req(), provider);

    expect(result.svg).toContain("<svg");
    expect(result.prompt).toContain("moon");
    expect(result.request.palette).toBe(BW);
    // off-palette color from the provider was snapped
    expect(result.svg).not.toContain("#00ff88");
    expect(result.report.issues.some((i) => i.rule === "palette")).toBe(true);
  });

  it("passes the built prompt and params to the provider", async () => {
    const provider = new RecordingProvider();
    await generate(req({ params: { model: "rec-1", temperature: 0.3, seed: 9 } }), provider);
    expect(provider.calls).toHaveLength(1);
    expect(provider.calls[0]!.prompt).toContain("moon");
    expect(provider.calls[0]!.params.seed).toBe(9);
  });
});

describe("generateVariations", () => {
  it("sweeps the cartesian product of palettes and seeds", async () => {
    const provider = new RecordingProvider();
    const results = await generateVariations(
      {
        tags: ["sun"],
        palettes: [BW, SEPIA],
        constraints: DEFAULT_CONSTRAINTS,
        baseParams: { model: "rec-1", temperature: 0.7 },
        seeds: [1, 2, 3],
      },
      provider
    );

    expect(results).toHaveLength(6);
    expect(provider.calls).toHaveLength(6);
  });

  it("tags each result with the palette and seed that produced it", async () => {
    const provider = new RecordingProvider();
    const results = await generateVariations(
      {
        tags: ["sun"],
        palettes: [BW, SEPIA],
        constraints: DEFAULT_CONSTRAINTS,
        baseParams: { model: "rec-1", temperature: 0.7 },
        seeds: [10, 20],
      },
      provider
    );

    const combos = results.map((r) => `${r.request.palette.id}:${r.request.params.seed}`);
    expect(combos).toEqual(["bw:10", "bw:20", "sepia:10", "sepia:20"]);
    // baseParams are preserved alongside the swept seed
    expect(results.every((r) => r.request.params.temperature === 0.7)).toBe(true);
  });
});
