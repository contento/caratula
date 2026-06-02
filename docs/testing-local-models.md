# Testing with Local Models (LM Studio, Ollama, vLLM)

## Setup: Three Types of Local LLMs

caratulai supports multiple local backends for cost-free, on-device generation.

### 1. **LM Studio** (Mac/Win/Linux GUI)
**Best for**: Quick testing, visual model management, single model at a time

- Download: https://lmstudio.ai/
- Run: Open LM Studio, download a model (e.g., `llama-2-7b-chat-q4_K_M`)
- Default URL: `http://localhost:1234/v1`
- Cost: Free, runs on your GPU/CPU

**Recommended models for testing**:
- `llama-2-7b-chat-q4_K_M` — fast, 7B params, good at following instructions
- `mistral-7b-instruct-v0.2-q4_K_M` — smaller, snappier, good for SVG
- `neural-chat-7b-v3-2-q4_K_M` — optimized for chat/instruction following

### 2. **Ollama** (Mac/Win/Linux CLI)
**Best for**: Production, scripting, multiple models, Docker

- Download: https://ollama.ai/
- Run locally: `ollama serve`
- Default URL: `http://localhost:11434/v1`
- Cost: Free, lightweight, stays running in background

**Recommended models for testing**:
```bash
ollama pull llama2              # 7B, balanced quality/speed
ollama pull mistral             # 7B, very fast
ollama pull neural-chat         # 7B, good instruction following
ollama pull qwen2.5-coder       # Excellent at SVG generation
ollama pull llama2-uncensored   # Experimental, more creative
```

Then generate with:
```bash
./caratulai.sh generate-svg star water --svg-provider ollama --svg-model llama2
```

### 3. **vLLM** (Advanced, fastest inference)
**Best for**: Benchmarking, speed testing, batch generation

- Install: `pip install vllm`
- Run: `python -m vllm.entrypoints.openai.api_server --model meta-llama/Llama-2-7b-chat-hf`
- Default URL: `http://localhost:8000/v1`
- Cost: Free, but requires NVIDIA GPU (faster than Ollama/LM Studio)

**Note**: vLLM is overkill for initial testing; start with LM Studio or Ollama.

---

## Quick Start: LM Studio on Mac

### Step 1: Start LM Studio
```bash
# Open LM Studio GUI
# Download model: mistral-7b-instruct-v0.2-q4_K_M (recommended for speed)
# Click "Start Server" (listens on http://localhost:1234/v1)
```

### Step 2: Test with caratulai
```bash
# Test sagan profile (minimal, gold/silver)
./caratulai.sh generate-svg star water --svg-provider lmstudio --svg-model mistral

# Test contento profile (dense, 80+ elements)
./caratulai.sh generate-svg star water --profile contento --svg-provider lmstudio --svg-model mistral

# Test picasso profile (sparse, single-line)
./caratulai.sh generate-svg star water --profile picasso --svg-provider lmstudio --svg-model mistral

# Auto-saves to ./output/ with timestamps (configured in YAML)
```

### Step 3: Check results
```bash
# View generated SVG
open output/*.svg

# View generation parameters
cat output/*.log
```

---

## M1 Testing Checklist

Test all profiles and measure quality:

- [ ] **Sagan** (minimal, technical) → should produce clean gold/silver diagrams
- [ ] **Picasso** (single-line) → should be sparse, elegant, unbroken lines
- [ ] **Contento** (dense, 80+ elements) → verify LLM can handle high element count
- [ ] **Dictionary** (vocabulary) → test if model understands visual symbols
- [ ] **Profile switching** → confirm prompt tone changes output style noticeably
- [ ] **Seed reproducibility** → same seed + same model = identical SVG
- [ ] **Performance** → measure time per generation (goal: < 30s on M1 Mac)

### Metrics to track:
- **Generation time**: `time ./caratulai.sh generate-svg star`
- **Element count**: Check SVG source: `grep -c '<' output/*.svg`
- **Color accuracy**: Verify colors in SVG match palette (use `grep fill``)
- **Prompt adherence**: Does output respect element count limits?

---

## Switching Providers at Runtime

### Via CLI flag (highest priority):
```bash
./caratulai.sh generate-svg star --svg-provider lmstudio --svg-model mistral
./caratulai.sh generate-svg star --svg-provider ollama --svg-model llama2
./caratulai.sh generate-svg star --svg-provider openrouter --svg-model x-ai/grok-2-1212
```

### Via YAML config (project default):
Edit `caratulai.config.yaml`:
```yaml
models:
  svg:
    provider: "lmstudio"        # or "ollama", "openrouter"
    model: "mistral"            # or "llama2", "qwen2.5-coder", etc.
```

---

## Troubleshooting

### "Connection refused: localhost:1234"
- LM Studio not running? Open app and click "Start Server"
- Wrong port? Check Settings → Server → Port (default is 1234)
- Try: `curl http://localhost:1234/v1/models` to verify server is live

### "Model not found: mistral"
- LM Studio: Download the model in GUI first (⬇️ button next to model name)
- Ollama: Run `ollama pull mistral` first, then `ollama serve`

### Generation is slow (> 1 min on M1)
- LM Studio/Ollama default to CPU (slow on Mac)
- If you have NVIDIA GPU: Enable GPU in settings
- Try smaller models: `mistral` (7B) or `neural-chat` (7B) instead of `llama2` (13B)
- Or use vLLM with NVIDIA GPU (much faster)

### SVG quality is poor
- Model may not understand SVG syntax
- Try: `--svg-model qwen2.5-coder` (optimized for code generation)
- Increase temperature: `-t 0.8` (more creativity)
- Or use a better model (Anthropic Claude, paid, but excellent at SVG)
- Check prompt in `.log` file — does it look reasonable?

### "Cannot find module '@caratulai/core'"
- Build first: `pnpm build`
- Verify dist exists: `ls packages/core/dist/index.js`

---

## Recommended Model Lineup (by tier)

### Tier 1: Speed (on Mac CPU)
- `mistral-7b` (fastest, acceptable quality for simple profiles)
- `neural-chat-7b` (good balance, still fast)

### Tier 2: Quality (on Mac with GPU or fast CPU)
- `llama-2-7b-chat` (balanced, reliable)
- `qwen2.5-coder` (better at code/SVG)

### Tier 3: Best quality (if budget allows)
- Anthropic Claude (paid, via OpenRouter) — best at SVG
- Grok-2 (via OpenRouter) — very good at complex instructions

Start with **Tier 1** to verify the pipeline works, then upgrade to Tier 2/3 as needed.
