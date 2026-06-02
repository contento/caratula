# Configuration

caratulai uses two configuration files with a clear separation of concerns:

## caratulai.config.yaml

**Purpose:** Shareable configuration — models, palettes, ratios, seeds, output directory, etc.

**Status:** Committed to repo. Safe to share with collaborators.

**Format:** YAML. Easy to read and edit manually.

**Example contents (as reference):**

```yaml
# Models & LLM settings
models:
  svg:
    provider: "ollama"        # or "lmstudio", "openrouter", "echo"
    model: "qwen2.5-coder"    # local model name
    temperature: 0.7
    seed: 42

# Generation settings
generation:
  profile: "sagan"            # or "picasso", "contento", "dictionary"
  palette: "sepia"            # or "bw", "grayscale", "palette-16", "palette-256"
  seed: null                  # null = random, or a specific number for reproducibility

# Output settings
output:
  directory: "./output"       # where to save SVG, PNG, PDF, etc.
  include_metadata: true      # save generation metadata alongside images
```

**Typical workflow:** edit this file to set your default model, palette, and output directory. The CLI uses these defaults but accepts `--flag` overrides.

## .env

**Purpose:** Secrets only — API keys for remote services, local server URLs.

**Status:** Gitignored. Never committed. Each developer creates their own copy.

**Format:** Shell-style `KEY=VALUE` (no quotes needed).

**How to set it up:**

1. Copy the example:
   ```sh
   cp .env.example .env
   ```

2. Fill in your secrets:
   ```bash
   # OpenRouter (if using remote models)
   OPENROUTER_API_KEY=sk-or-...

   # Custom local server URLs (if not default)
   # LM_STUDIO_URL=http://localhost:1234/v1
   # OLLAMA_URL=http://localhost:11434/v1
   ```

**Typical secrets:**
- `OPENROUTER_API_KEY` — for remote OpenRouter access
- Custom backend URLs (if your LM Studio or Ollama runs elsewhere)
- Database credentials (Postgres, SQLite path) — for future web/server surfaces

## Separation of Concerns

| File | Committed? | Contains | Edited by |
|---|---|---|---|
| `caratulai.config.yaml` | ✅ Yes | Model names, palette, output dir, generation params | Everyone (coordinated) |
| `.env` | ❌ No | API keys, passwords, personal server URLs | Only locally (each dev) |

**Benefits:**
- **Safe:** secrets never leak to git
- **Shareable:** config changes can be coordinated via git
- **Flexible:** each developer can override with their own `.env` without affecting the team

## Configuration Priority (CLI overrides config file)

When you run a CLI command, the priority is:

1. **CLI flags** (highest) — `--provider ollama --model qwen2.5-coder`
2. **Environment variables** (if set) — `export SVG_MODEL=claude`
3. **caratulai.config.yaml** (lowest) — `generation.profile: sagan`

Example — to override the config file just for one generation:

```sh
# config.yaml says "ollama", but use lmstudio just this once
node packages/cli/dist/index.js generate star water --provider lmstudio --model mistral --out out/test.svg
```

## See Also

- [[09-Getting Started]] — first-time setup
- [[11-LLM Providers]] — which provider to choose and how to set up each one
- [[12-Testing Local Models]] — verify your config works on your machine
