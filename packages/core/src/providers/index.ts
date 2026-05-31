import type { GenerationParams, LLMProvider } from "../types.js";

export type { LLMProvider };

/**
 * A model ladder: ordered providers, cheapest/local first. `generate` tries each in order
 * until one returns SVG-looking output, so a costly remote model is only used as a fallback.
 */
export class ModelLadder {
  constructor(private readonly providers: LLMProvider[]) {}

  get rungs(): { provider: string; model: string }[] {
    return this.providers.flatMap((p) => p.models.map((model) => ({ provider: p.name, model })));
  }

  async generateSvg(prompt: string, params: GenerationParams): Promise<string> {
    let lastErr: unknown;
    for (const provider of this.providers) {
      try {
        const out = await provider.generateSvg(prompt, params);
        if (/<svg[\s\S]*<\/svg>/i.test(out)) return out;
      } catch (err) {
        lastErr = err;
      }
    }
    throw new Error(
      `No provider produced SVG (${this.providers.map((p) => p.name).join(", ")})`,
      { cause: lastErr }
    );
  }
}
