import { describe, it, expect } from "vitest";
import type { LLMProvider, GenerationParams } from "./types.js";
import { buildExtractionPrompt, extractTags, EXTRACTION_SYSTEM_PROMPT } from "./extract.js";

class RecordingProvider implements LLMProvider {
  readonly name = "recording";
  readonly models = ["test"];

  calls: Array<{ prompt: string; params: GenerationParams }> = [];
  response: string = "";

  async generateSvg(prompt: string, params: GenerationParams): Promise<string> {
    this.calls.push({ prompt, params });
    return this.response;
  }
}

describe("extract", () => {
  describe("buildExtractionPrompt", () => {
    it("includes the input text", () => {
      const prompt = buildExtractionPrompt("A starry ocean voyage");
      expect(prompt).toContain("A starry ocean voyage");
    });

    it("instructs the model to return comma-separated tags", () => {
      const prompt = buildExtractionPrompt("test");
      expect(prompt).toContain("comma-separated");
    });

    it("specifies no explanation or markdown", () => {
      const prompt = buildExtractionPrompt("test");
      expect(prompt).toContain("No explanation");
    });
  });

  describe("extractTags", () => {
    it("parses comma-separated response", async () => {
      const provider = new RecordingProvider();
      provider.response = "star, water, ship";

      const tags = await extractTags("test input", provider, { model: "test" });

      expect(tags).toEqual(["star", "water", "ship"]);
    });

    it("parses newline-separated response", async () => {
      const provider = new RecordingProvider();
      provider.response = "star\nwater\nship";

      const tags = await extractTags("test input", provider, { model: "test" });

      expect(tags).toEqual(["star", "water", "ship"]);
    });

    it("lowercases tags", async () => {
      const provider = new RecordingProvider();
      provider.response = "Star, WATER, Ship";

      const tags = await extractTags("test input", provider, { model: "test" });

      expect(tags).toEqual(["star", "water", "ship"]);
    });

    it("trims whitespace", async () => {
      const provider = new RecordingProvider();
      provider.response = "  star  ,  water  ";

      const tags = await extractTags("test input", provider, { model: "test" });

      expect(tags).toEqual(["star", "water"]);
    });

    it("filters empty strings", async () => {
      const provider = new RecordingProvider();
      provider.response = "star, , water, ";

      const tags = await extractTags("test input", provider, { model: "test" });

      expect(tags).toEqual(["star", "water"]);
    });

    it("handles a single tag", async () => {
      const provider = new RecordingProvider();
      provider.response = "star";

      const tags = await extractTags("test input", provider, { model: "test" });

      expect(tags).toEqual(["star"]);
    });

    it("calls provider.generateSvg once with built prompt", async () => {
      const provider = new RecordingProvider();
      provider.response = "test";

      await extractTags("test input", provider, { model: "mymodel" });

      expect(provider.calls).toHaveLength(1);
      expect(provider.calls[0].prompt).toContain("test input");
      expect(provider.calls[0].params.model).toBe("mymodel");
    });

    it("defaults to low temperature (0.2) for determinism", async () => {
      const provider = new RecordingProvider();
      provider.response = "test";

      await extractTags("test input", provider, { model: "test" });

      expect(provider.calls[0].params.temperature).toBe(0.2);
    });

    it("respects provided temperature override", async () => {
      const provider = new RecordingProvider();
      provider.response = "test";

      await extractTags("test input", provider, { model: "test", temperature: 0.5 });

      expect(provider.calls[0].params.temperature).toBe(0.5);
    });

    it("preserves seed if provided", async () => {
      const provider = new RecordingProvider();
      provider.response = "test";

      await extractTags("test input", provider, { model: "test", seed: 42 });

      expect(provider.calls[0].params.seed).toBe(42);
    });
  });

  describe("EXTRACTION_SYSTEM_PROMPT", () => {
    it("is defined", () => {
      expect(EXTRACTION_SYSTEM_PROMPT).toBeDefined();
      expect(EXTRACTION_SYSTEM_PROMPT.length).toBeGreaterThan(0);
    });

    it("mentions extraction and visual concepts", () => {
      expect(EXTRACTION_SYSTEM_PROMPT).toContain("extract");
      expect(EXTRACTION_SYSTEM_PROMPT).toContain("visual");
    });
  });
});
