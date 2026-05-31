import type { GenerationParams, LLMProvider } from "../types.js";
import { SYSTEM_PROMPT } from "../prompt.js";

/**
 * Configuration for any OpenAI chat-completions-compatible backend.
 * Ollama, LM Studio, OpenRouter (and OpenAI itself) all speak this protocol, so one
 * implementation covers them all — the factories below just supply defaults.
 */
export interface OpenAICompatConfig {
  name: string;
  /** Base URL including the version path, e.g. http://localhost:11434/v1 */
  baseUrl: string;
  model: string;
  apiKey?: string;
  /** Extra headers (OpenRouter uses HTTP-Referer / X-Title for attribution). */
  headers?: Record<string, string>;
  maxTokens?: number;
  timeoutMs?: number;
}

interface ChatCompletionResponse {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string };
}

/** An LLM provider that calls a `/chat/completions` endpoint and returns the raw SVG text. */
export class OpenAICompatProvider implements LLMProvider {
  readonly name: string;
  readonly models: string[];

  constructor(private readonly config: OpenAICompatConfig) {
    this.name = config.name;
    this.models = [config.model];
  }

  async generateSvg(prompt: string, params: GenerationParams): Promise<string> {
    const { baseUrl, model, apiKey, headers, maxTokens = 4096, timeoutMs = 120_000 } = this.config;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(`${baseUrl.replace(/\/+$/, "")}/chat/completions`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
          ...headers,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
          temperature: params.temperature,
          ...(params.seed !== undefined ? { seed: params.seed } : {}),
          max_tokens: maxTokens,
          stream: false,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`${this.name} HTTP ${res.status}: ${body.slice(0, 300)}`);
      }

      const data = (await res.json()) as ChatCompletionResponse;
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error(`${this.name}: empty response${data.error?.message ? ` (${data.error.message})` : ""}`);
      }
      return content;
    } finally {
      clearTimeout(timer);
    }
  }
}
