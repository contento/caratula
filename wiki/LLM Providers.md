# LLM Providers

caratulai generates SVG by asking an LLM. The whole goal is **minimalistic text → simple images**: a few words in, a handful of fundamental lines out. caratulai speaks the **OpenAI chat-completions API**, so any compatible backend works — local or remote — behind the same `--provider` flag.

| Provider | Where it runs | Cost | Base URL (default) | API key |
| --- | --- | --- | --- | --- |
| `echo` | in-process | free | — | — |
| `ollama` | local | free | `http://localhost:11434/v1` | none |
| `lmstudio` | local | free | `http://localhost:1234/v1` | none |
| `openrouter` | remote | pay-per-token | `https://openrouter.ai/api/v1` | `OPENROUTER_API_KEY` |

`echo` is a deterministic placeholder (no model) so the pipeline runs with zero setup. Everything below is a real model. Whatever it returns, the validator still snaps colors to the palette, drops disallowed elements, removes text, and caps complexity — so even a small model stays on-aesthetic.

> **Tip:** prefer instruction-following / coding models for SVG. Bigger models draw cleaner; smaller ones are messier but the validator cleans up the palette and primitives.

---

## Ollama (local, free)

1. Install from https://ollama.com and start it (the app runs the server; or `ollama serve`).
2. Pull a model — a small coding model is a good default for SVG:

   ```sh
   ollama pull qwen2.5-coder
   ```

3. Generate:

   ```sh
   node packages/cli/dist/index.js generate star water travel --palette sepia \
     --provider ollama --model qwen2.5-coder --out out/idea.svg
   ```

Override the host with `--base-url http://your-host:11434/v1` if Ollama runs elsewhere.

## LM Studio (local, free)

1. Install https://lmstudio.ai, download a model, and load it.
2. Start the local server (Developer ▸ **Start Server**) — it listens on `:1234` by default.
3. Use the **exact model identifier** shown in LM Studio as `--model`:

   ```sh
   node packages/cli/dist/index.js generate moon tide --palette grayscale \
     --provider lmstudio --model "qwen2.5-coder-7b-instruct" --out out/idea.svg
   ```

## OpenRouter (remote — one key, many models)

One API key gives access to hundreds of models (Grok, Gemini, Llama, Claude, …), which makes it the easiest way to try the costlier/stronger tiers.

1. Create a key at https://openrouter.ai/keys and export it:

   ```sh
   export OPENROUTER_API_KEY=sk-or-...
   ```

2. Pick a model with `--model`. Two suggestions:

   ```sh
   # Grok (xAI) — capable, characterful
   node packages/cli/dist/index.js generate star water travel --palette sepia \
     --provider openrouter --model x-ai/grok-2-1212 --out out/grok.svg

   # Cheapest sensible default — fast and very cheap, plenty for simple SVG
   node packages/cli/dist/index.js generate star water travel --palette sepia \
     --provider openrouter --model google/gemini-2.0-flash-001 --out out/cheap.svg
   ```

**Cheapest options:** for minimal text → simple line art you don't need a frontier model. Good low-cost picks on OpenRouter are `google/gemini-2.0-flash-001` and the small Llamas (e.g. `meta-llama/llama-3.3-70b-instruct`, or the tiny `meta-llama/llama-3.2-3b-instruct` for near-free). Model ids and prices change — check https://openrouter.ai/models for the current list (and any free-tier models).

---

## Notes

- API keys are read by the **CLI** (the surface), never by `@caratulai/core` — the engine stays I/O-agnostic. Put secrets in `.env` (gitignored); see `.env.example`.
- Local servers can be slow on first call (model load). Providers use generous timeouts.
- A future **model ladder** will chain providers (local first, escalate to remote); the building block (`ModelLadder`) already exists in `core`.

## See Also

- [[Testing Local Models]] — quick-start and benchmarking for LM Studio / Ollama
- [[Configuration]] — how to set provider in config.yaml or .env
- [[Getting Started]] — first-time setup with a real LLM
