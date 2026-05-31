import { OpenAICompatProvider } from "./openai-compat.js";

export interface OpenRouterOptions {
  /** OpenRouter model id, e.g. "x-ai/grok-2-1212". Default is Grok. */
  model?: string;
  /** Required. Pass from OPENROUTER_API_KEY (read it in the surface, not in core). */
  apiKey: string;
  baseUrl?: string;
  /** Optional attribution shown on openrouter.ai. */
  referer?: string;
  title?: string;
  timeoutMs?: number;
}

/** Remote generation via OpenRouter — one key, hundreds of models (Grok, Gemini, Llama, …). */
export function createOpenRouterProvider(opts: OpenRouterOptions): OpenAICompatProvider {
  if (!opts.apiKey) {
    throw new Error("OpenRouter requires an API key (set OPENROUTER_API_KEY).");
  }
  return new OpenAICompatProvider({
    name: "openrouter",
    baseUrl: opts.baseUrl ?? "https://openrouter.ai/api/v1",
    model: opts.model ?? "x-ai/grok-2-1212",
    apiKey: opts.apiKey,
    headers: {
      ...(opts.referer ? { "HTTP-Referer": opts.referer } : {}),
      ...(opts.title ? { "X-Title": opts.title } : {}),
    },
    timeoutMs: opts.timeoutMs ?? 120_000,
  });
}
