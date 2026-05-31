import { OpenAICompatProvider } from "./openai-compat.js";

export interface LMStudioOptions {
  /** Must match the model loaded in LM Studio's server (or its JIT-loadable id). */
  model?: string;
  /** LM Studio's local server. Default http://localhost:1234/v1 */
  baseUrl?: string;
  timeoutMs?: number;
}

/** Local generation via LM Studio's OpenAI-compatible server. Load a model and start the server. */
export function createLMStudioProvider(opts: LMStudioOptions = {}): OpenAICompatProvider {
  return new OpenAICompatProvider({
    name: "lmstudio",
    baseUrl: opts.baseUrl ?? "http://localhost:1234/v1",
    model: opts.model ?? "local-model",
    apiKey: "lm-studio", // ignored by LM Studio
    timeoutMs: opts.timeoutMs ?? 180_000,
  });
}
