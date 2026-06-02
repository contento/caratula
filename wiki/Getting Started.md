# Getting Started

## Installation & Setup

Requires **Node ≥ 20** and **pnpm** (enable it once with `corepack enable pnpm`).

```sh
pnpm install
pnpm build

# Verify the build
pnpm typecheck
```

## Running the CLI

The CLI is ready to use. It currently uses the `echo` provider (deterministic placeholder) so you can test without setting up an LLM.

### List available palettes

```sh
node packages/cli/dist/index.js palettes
```

### Generate a simple image

```sh
node packages/cli/dist/index.js generate star water travel --palette sepia --out out/idea.svg
```

This will:
1. Parse the tags: `star`, `water`, `travel`
2. Build a prompt from the tags, palette, and profile
3. Call the echo provider (placeholder)
4. Validate the SVG output
5. Save to `out/idea.svg`

### View the output

```sh
open out/idea.svg  # on macOS
# or use your preferred SVG viewer on Windows/Linux
```

## Using a Real LLM (Local)

To use a real LLM, set up a local backend (LM Studio or Ollama) and configure caratulai.

### LM Studio (easiest for testing on Mac)

1. Download and install from https://lmstudio.ai
2. Download a model (e.g., `mistral-7b-instruct`)
3. Start the server (Developer ▸ **Start Server**) — listens on `http://localhost:1234/v1`
4. Generate with caratulai:

```sh
node packages/cli/dist/index.js generate star water --palette sepia \
  --provider lmstudio --model mistral-7b-instruct --out out/idea.svg
```

### Ollama (production, CLI-friendly)

1. Install from https://ollama.com
2. Pull a model:

```sh
ollama pull qwen2.5-coder
```

3. Start the server (runs in background):

```sh
ollama serve
```

4. Generate with caratulai:

```sh
node packages/cli/dist/index.js generate star water --palette sepia \
  --provider ollama --model qwen2.5-coder --out out/idea.svg
```

## Configuration

**Two files control behavior:**

1. **`caratulai.config.yaml`** — shareable configuration (models, palette, output dir, etc.). Committed to repo.
2. **`.env`** — secrets only (API keys). Gitignored. Copy `.env.example` and fill in your keys.

See [[Configuration]] for details.

## Next Steps

- Read [[Principles]] — understand the aesthetic constraints
- Read [[Profiles]] — learn about the different generation styles
- Read [[Stack]] — understand the architecture
- Read [[Contributing]] — if you want to contribute code
- Try different [[LLM Providers]] — local and remote
- See [[Testing Local Models]] — quick-start with LM Studio/Ollama

## Troubleshooting

**"Cannot find module '@caratulai/core'"**
- Make sure you ran `pnpm build` first: `ls packages/core/dist/index.js`

**Connection refused: localhost:1234**
- LM Studio not running? Open the app and click "Start Server"
- Check Settings → Server → Port (default is 1234)
- Verify with: `curl http://localhost:1234/v1/models`

**SVG output is empty or malformed**
- The echo provider emits a placeholder for testing
- Switch to a real LLM (LM Studio or Ollama) for actual generation
- Check the provider is running and accessible

**Generation is slow**
- First generation with LM Studio/Ollama can be slow (model load)
- Try a smaller model: `mistral-7b` or `neural-chat-7b` instead of `llama2-13b`
- See [[Testing Local Models]] for detailed benchmarking

## See Also

- [[LLM Providers]] — full setup guide for all backends
- [[Testing Local Models]] — benchmark models and measure performance
- [[Configuration]] — config.yaml reference
