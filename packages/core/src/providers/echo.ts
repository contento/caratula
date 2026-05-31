import type { GenerationParams, LLMProvider } from "../types.js";

/**
 * A dependency-free stand-in provider so the pipeline runs end-to-end before any real LLM is
 * wired up. It emits a deterministic placeholder SVG (intentionally a little messy, with an
 * off-palette color and a stray <text>) so the validator visibly does its job.
 *
 * Replace with real providers (Anthropic, OpenAI, Google, Ollama) — see TODO providers.
 */
export class EchoProvider implements LLMProvider {
  readonly name = "echo";
  readonly models = ["echo-1"];

  async generateSvg(_prompt: string, params: GenerationParams): Promise<string> {
    const seed = params.seed ?? 0;
    const cx = 128 + (seed % 64);
    const cy = 256;
    return [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">',
      '  <rect x="0" y="0" width="512" height="512" fill="#ffffff"/>',
      `  <circle cx="${cx}" cy="${cy}" r="96" fill="none" stroke="#111111" stroke-width="3"/>`,
      `  <path d="M64 448 L256 96 L448 448" fill="none" stroke="#7a1f1f" stroke-width="3"/>`,
      '  <text x="20" y="40" fill="#00ff88">placeholder</text>',
      "</svg>",
    ].join("\n");
  }
}
