import {
  EchoProvider,
  createOllamaProvider,
  createLMStudioProvider,
  createOpenRouterProvider,
  type LLMProvider,
} from "@caratulai/core";

export interface ProviderOptions {
  provider: string;
  model?: string;
  baseUrl?: string;
}

/**
 * Construct an LLM provider from CLI options. Env is injectable for testing; keys are read here
 * in the surface, never in `@caratulai/core`. See docs/providers.md.
 */
export function buildProvider(
  opts: ProviderOptions,
  env: Record<string, string | undefined> = process.env
): LLMProvider {
  switch (opts.provider) {
    case "echo":
      return new EchoProvider();
    case "ollama":
      return createOllamaProvider({ model: opts.model, baseUrl: opts.baseUrl });
    case "lmstudio":
      return createLMStudioProvider({ model: opts.model, baseUrl: opts.baseUrl });
    case "openrouter":
      return createOpenRouterProvider({
        model: opts.model,
        baseUrl: opts.baseUrl,
        apiKey: env.OPENROUTER_API_KEY ?? "",
        referer: "https://github.com/contento/caratulai",
        title: "caratulai",
      });
    default:
      throw new Error(
        `Unknown provider "${opts.provider}". Use: echo | ollama | lmstudio | openrouter.`
      );
  }
}
