import { OpenAICompatProvider } from "./openai-compat.js";

export interface OllamaOptions {
  /** Defaults to a small coding model, which tends to emit cleaner SVG. */
  model?: string;
  /** Ollama's OpenAI-compatible endpoint. Default http://localhost:11434/v1 */
  baseUrl?: string;
  timeoutMs?: number;
}

/** Local generation via Ollama (free, offline). Run `ollama serve` and pull a model first. */
export function createOllamaProvider(opts: OllamaOptions = {}): OpenAICompatProvider {
  return new OpenAICompatProvider({
    name: "ollama",
    baseUrl: opts.baseUrl ?? "http://localhost:11434/v1",
    model: opts.model ?? "qwen2.5-coder",
    apiKey: "ollama", // ignored by Ollama, present to satisfy strict OpenAI clients
    timeoutMs: opts.timeoutMs ?? 180_000,
  });
}
