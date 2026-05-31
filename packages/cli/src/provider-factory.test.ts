import { describe, it, expect } from "vitest";
import { buildProvider } from "./provider-factory.js";

describe("buildProvider", () => {
  it("builds each known backend", () => {
    expect(buildProvider({ provider: "echo" }).name).toBe("echo");
    expect(buildProvider({ provider: "ollama" }).name).toBe("ollama");
    expect(buildProvider({ provider: "lmstudio" }).name).toBe("lmstudio");
    expect(buildProvider({ provider: "openrouter" }, { OPENROUTER_API_KEY: "sk-or-x" }).name).toBe(
      "openrouter"
    );
  });

  it("passes the model through to the provider", () => {
    expect(buildProvider({ provider: "ollama", model: "llama3.2" }).models[0]).toBe("llama3.2");
  });

  it("reads the OpenRouter key from the injected env and fails without it", () => {
    expect(() => buildProvider({ provider: "openrouter" }, {})).toThrow(/API key/);
    expect(buildProvider({ provider: "openrouter" }, { OPENROUTER_API_KEY: "k" }).name).toBe("openrouter");
  });

  it("rejects an unknown provider with a helpful message", () => {
    expect(() => buildProvider({ provider: "dalle" })).toThrow(/Unknown provider "dalle"/);
  });
});
