import { describe, it, expect, vi, afterEach } from "vitest";
import { OpenAICompatProvider } from "./providers/openai-compat.js";
import { ModelLadder } from "./providers/index.js";
import { EchoProvider } from "./providers/echo.js";
import { createOllamaProvider } from "./providers/ollama.js";
import { createLMStudioProvider } from "./providers/lmstudio.js";
import { createOpenRouterProvider } from "./providers/openrouter.js";
import { SYSTEM_PROMPT } from "./prompt.js";
import type { GenerationParams, LLMProvider } from "./types.js";

const PARAMS: GenerationParams = { model: "m", temperature: 0.7, seed: 1 };

function okResponse(content: string) {
  return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content } }] }), text: async () => "" };
}
function badResponse(status: number, body: string) {
  return { ok: false, status, json: async () => ({}), text: async () => body };
}

afterEach(() => vi.unstubAllGlobals());

describe("OpenAICompatProvider — request shaping", () => {
  it("posts to <baseUrl>/chat/completions, trimming trailing slashes", async () => {
    const fetchMock = vi.fn(async () => okResponse("<svg/>"));
    vi.stubGlobal("fetch", fetchMock);
    const p = new OpenAICompatProvider({ name: "x", baseUrl: "http://host/v1/", model: "m" });
    await p.generateSvg("PROMPT", PARAMS);
    expect(fetchMock.mock.calls[0]![0]).toBe("http://host/v1/chat/completions");
  });

  it("sends system + user messages, temperature, seed, max_tokens", async () => {
    const fetchMock = vi.fn(async () => okResponse("<svg/>"));
    vi.stubGlobal("fetch", fetchMock);
    const p = new OpenAICompatProvider({ name: "x", baseUrl: "http://h/v1", model: "mymodel" });
    await p.generateSvg("PROMPT", PARAMS);

    const body = JSON.parse(fetchMock.mock.calls[0]![1]!.body);
    expect(body.model).toBe("mymodel");
    expect(body.messages[0]).toEqual({ role: "system", content: SYSTEM_PROMPT });
    expect(body.messages[1]).toEqual({ role: "user", content: "PROMPT" });
    expect(body.temperature).toBe(0.7);
    expect(body.seed).toBe(1);
    expect(body.max_tokens).toBe(4096);
    expect(body.stream).toBe(false);
  });

  it("omits seed when undefined", async () => {
    const fetchMock = vi.fn(async () => okResponse("<svg/>"));
    vi.stubGlobal("fetch", fetchMock);
    const p = new OpenAICompatProvider({ name: "x", baseUrl: "http://h/v1", model: "m" });
    await p.generateSvg("PROMPT", { model: "m", temperature: 0.2 });
    const body = JSON.parse(fetchMock.mock.calls[0]![1]!.body);
    expect("seed" in body).toBe(false);
  });

  it("adds Authorization only when an apiKey is present, and merges custom headers", async () => {
    const fetchMock = vi.fn(async () => okResponse("<svg/>"));
    vi.stubGlobal("fetch", fetchMock);

    const withKey = new OpenAICompatProvider({
      name: "x", baseUrl: "http://h/v1", model: "m", apiKey: "secret",
      headers: { "X-Title": "caratulai" },
    });
    await withKey.generateSvg("P", PARAMS);
    const h1 = fetchMock.mock.calls[0]![1]!.headers;
    expect(h1.authorization).toBe("Bearer secret");
    expect(h1["X-Title"]).toBe("caratulai");

    const noKey = new OpenAICompatProvider({ name: "x", baseUrl: "http://h/v1", model: "m" });
    await noKey.generateSvg("P", PARAMS);
    const h2 = fetchMock.mock.calls[1]![1]!.headers;
    expect("authorization" in h2).toBe(false);
  });

  it("returns the assistant message content", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => okResponse("<svg><circle/></svg>")));
    const p = new OpenAICompatProvider({ name: "x", baseUrl: "http://h/v1", model: "m" });
    expect(await p.generateSvg("P", PARAMS)).toBe("<svg><circle/></svg>");
  });
});

describe("OpenAICompatProvider — failures", () => {
  it("throws with name and status on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => badResponse(429, "rate limited")));
    const p = new OpenAICompatProvider({ name: "openrouter", baseUrl: "http://h/v1", model: "m" });
    await expect(p.generateSvg("P", PARAMS)).rejects.toThrow(/openrouter HTTP 429/);
  });

  it("throws on an empty response", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => okResponse("")));
    const p = new OpenAICompatProvider({ name: "x", baseUrl: "http://h/v1", model: "m" });
    await expect(p.generateSvg("P", PARAMS)).rejects.toThrow(/empty response/);
  });

  it("surfaces a provider error message when the response carries one", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ choices: [], error: { message: "context length exceeded" } }),
      text: async () => "",
    })));
    const p = new OpenAICompatProvider({ name: "x", baseUrl: "http://h/v1", model: "m" });
    await expect(p.generateSvg("P", PARAMS)).rejects.toThrow(/context length exceeded/);
  });

  it("still throws cleanly when reading the error body fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: false,
      status: 500,
      json: async () => ({}),
      text: async () => { throw new Error("stream broke"); },
    })));
    const p = new OpenAICompatProvider({ name: "x", baseUrl: "http://h/v1", model: "m" });
    await expect(p.generateSvg("P", PARAMS)).rejects.toThrow(/HTTP 500/);
  });

  it("forwards OpenRouter attribution headers to the request", async () => {
    const fetchMock = vi.fn(async () => okResponse("<svg/>"));
    vi.stubGlobal("fetch", fetchMock);
    const p = createOpenRouterProvider({
      apiKey: "sk-or-x", referer: "https://github.com/contento/caratulai", title: "caratulai",
    });
    await p.generateSvg("P", PARAMS);
    const h = fetchMock.mock.calls[0]![1]!.headers;
    expect(h["HTTP-Referer"]).toBe("https://github.com/contento/caratulai");
    expect(h["X-Title"]).toBe("caratulai");
  });

  it("aborts after the timeout", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: string, init: { signal: AbortSignal }) =>
          new Promise((_resolve, reject) => {
            init.signal.addEventListener("abort", () => reject(new Error("aborted")));
          })
      )
    );
    const p = new OpenAICompatProvider({ name: "x", baseUrl: "http://h/v1", model: "m", timeoutMs: 30 });
    await expect(p.generateSvg("P", PARAMS)).rejects.toThrow();
  });
});

describe("ModelLadder", () => {
  class Stub implements LLMProvider {
    constructor(
      readonly name: string,
      readonly models: string[],
      private readonly behavior: "svg" | "junk" | "throw"
    ) {}
    async generateSvg(): Promise<string> {
      if (this.behavior === "throw") throw new Error(`${this.name} down`);
      return this.behavior === "svg" ? "<svg><line/></svg>" : "sorry, I cannot draw that";
    }
  }

  it("lists rungs as provider × model", () => {
    const ladder = new ModelLadder([new Stub("a", ["m1", "m2"], "svg"), new Stub("b", ["m3"], "svg")]);
    expect(ladder.rungs).toEqual([
      { provider: "a", model: "m1" },
      { provider: "a", model: "m2" },
      { provider: "b", model: "m3" },
    ]);
  });

  it("returns the first SVG-looking output", async () => {
    const ladder = new ModelLadder([new Stub("a", ["m"], "svg"), new Stub("b", ["m"], "svg")]);
    expect(await ladder.generateSvg("p", PARAMS)).toContain("<svg");
  });

  it("skips a provider that throws and falls through", async () => {
    const ladder = new ModelLadder([new Stub("a", ["m"], "throw"), new Stub("b", ["m"], "svg")]);
    expect(await ladder.generateSvg("p", PARAMS)).toContain("<svg");
  });

  it("skips non-SVG output and falls through", async () => {
    const ladder = new ModelLadder([new Stub("a", ["m"], "junk"), new Stub("b", ["m"], "svg")]);
    expect(await ladder.generateSvg("p", PARAMS)).toContain("<svg");
  });

  it("throws naming all providers when none produce SVG", async () => {
    const ladder = new ModelLadder([new Stub("a", ["m"], "junk"), new Stub("b", ["m"], "throw")]);
    await expect(ladder.generateSvg("p", PARAMS)).rejects.toThrow(/a, b/);
  });
});

describe("provider factories", () => {
  it("ollama defaults to a local coding model", () => {
    const p = createOllamaProvider();
    expect(p.name).toBe("ollama");
    expect(p.models[0]).toBe("qwen2.5-coder");
    expect(createOllamaProvider({ model: "llama3.2" }).models[0]).toBe("llama3.2");
  });

  it("lmstudio has a placeholder default model", () => {
    expect(createLMStudioProvider().name).toBe("lmstudio");
    expect(createLMStudioProvider().models[0]).toBe("local-model");
  });

  it("openrouter requires a key and defaults to Grok", () => {
    expect(() => createOpenRouterProvider({ apiKey: "" })).toThrow(/API key/);
    const p = createOpenRouterProvider({ apiKey: "sk-or-x" });
    expect(p.name).toBe("openrouter");
    expect(p.models[0]).toBe("x-ai/grok-2-1212");
    expect(createOpenRouterProvider({ apiKey: "k", model: "google/gemini-2.0-flash-001" }).models[0]).toBe(
      "google/gemini-2.0-flash-001"
    );
  });
});

describe("EchoProvider", () => {
  it("produces a valid SVG that varies with the seed", async () => {
    const echo = new EchoProvider();
    const a = await echo.generateSvg("p", { model: "echo-1", temperature: 0, seed: 0 });
    const b = await echo.generateSvg("p", { model: "echo-1", temperature: 0, seed: 5 });
    expect(a).toMatch(/<svg[\s\S]*<\/svg>/);
    expect(a).not.toBe(b);
  });

  it("defaults a missing seed without throwing", async () => {
    const svg = await new EchoProvider().generateSvg("p", { model: "echo-1", temperature: 0 });
    expect(svg).toMatch(/<svg[\s\S]*<\/svg>/);
  });
});
