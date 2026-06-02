# caratulai

[![CI](https://github.com/contento/caratulai/actions/workflows/ci.yml/badge.svg)](https://github.com/contento/caratulai/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Carátula** (Spanish): the cover sheet / title page — the first image you meet.

caratulai is an **alien image generator**: it turns *concepts* (tags, not narratives) into
**simple vector images** — line, arc, diagonal — in restrained, fundamental palettes.

The lineage is **contento / conten.to**, the **Voyager 1 Golden Record** and Pioneer plaque,
and **Picasso's line**. The goal is imagery that feels like a message left for someone who has
never seen Earth: fundamental, symbolic, quiet. The reaction against conten.to's current imagery
is deliberate — **less obvious, far less colorful.**

The musical analogy: caratulai plays **simple chords — A, Am, C#.** This is *not* Berlioz or
Philip Glass; it's the **Beatles, Paul Simon, Camilo Sesto, Gardel, Edith Piaf** — a small
vocabulary of familiar forms arranged for directness and feeling. Song-craft, not symphony.

## Why the name

**Carátula** is Spanish for the *cover* — the front of a thing. It's what you call the cover of a
book, the sleeve of an **LP**, the case of a **CD**, and now the header of a **blog**. The carátula
is the first image you meet, the face a work shows the world.

The name is a stance. Generated imagery had become very complex — and as much as I love Bach and
computers, I value **simplicity and minimalism** above all. I love a **simple carátula**. This tool
exists to make them.

**caratulai** = *carátula* + **AI** — the cover, drawn by a machine.

## Principles

- **Tags, not stories.** Core processing is an ontology of simple concepts, not prose prompts.
  When provided with an image or narrative text, the system extracts the ontology first before generating.
- **Vector first.** SVG is the native output; raster/PDF are exports.
- **Fundamental palettes only.** B/W, sepia, grayscale, 16-color, 256-color — always restrained.
  **No rainbows. No rococo. No baroque.**
- **Simple lines.** Arcs and diagonals welcome; complexity minimized.
- **Little or no text.** The image carries the meaning.
- **Reproducible.** Every image stores the tags, palette, model, and parameters that made it.
- **Simple chords.** A small set of familiar elements, arranged for feeling — not complexity.

## Image Generation Profiles

Seven aesthetic styles, each with distinct constraints and prompt tone. **All profiles enforce ZERO text elements.**

| Profile | Aesthetic | Palette | Max Elements | Shapes | Use Case |
| --- | --- | --- | --- | --- | --- |
| **sagan** | Voyager Golden Record | Gold + Silver | 48 | Fundamental only | Cosmic, profound, archival |
| **picasso** | Single-line drawings | B/W | 20 | Fundamental only | Sophisticated, minimal, elegant |
| **contento** | Rich, dense, layered | 256-color | 80 | All shapes + effects | Visual abundance, complexity |
| **dictionary** | Vocabulary & icons | 256-color | 60 | All shapes + effects | Semantic visual library |
| **freud** *(future)* | Layers of the psyche | Grayscale + sepia | 50–70 | All shapes | Unconscious drives, dream logic |
| **jung** *(future)* | Archetypal symbols | 256-color | 50 | All shapes | Psychological/symbolic depth |
| **nietzsche** *(future)* | Full ontology-driven | 256-color | Variable | All shapes | Philosophical/conceptual mapping |

**Text policy**: All profiles have `maxTextElements: 0` — **zero text in output**, enforced by validator and reinforced in prompts.

**Usage**: Set in `caratulai.config.yaml` (`generation.profile: sagan`) or CLI (`--profile contento`).

## Surfaces

One core engine, four faces: **Web** · **TUI/CLI** · **Desktop** · **Backend** —
on **Windows, macOS, Linux, Web**.

## Status

🚧 Early build. The **core engine** and **CLI** are scaffolded; web/desktop/server are deferred.
See **[SPEC.md](SPEC.md)** for scope, architecture, and open questions.

## Getting started

Requires Node ≥ 20 and pnpm (enable it once with `corepack enable pnpm`).

```sh
pnpm install
pnpm build

# list the built-in fundamental palettes
node packages/cli/dist/index.js palettes

# generate an SVG from concept tags (uses the placeholder Echo provider for now)
node packages/cli/dist/index.js generate star water travel --palette sepia --out out/idea.svg
```

The Echo provider emits a deterministic placeholder (with an off-palette color and stray text)
so you can see the validator snap colors and strip disallowed elements. Real LLM providers
(Ollama → Anthropic → …) wire into the model ladder next — see the TODO in
[packages/cli/src/index.ts](packages/cli/src/index.ts).

### Layout

| Package | Role |
| --- | --- |
| [`packages/core`](packages/core) | Engine: types, palettes, prompt builder, providers, SVG validator, generate |
| [`packages/cli`](packages/cli) | Command-line interface over the engine |

## LLM providers

caratulai turns minimal text into simple SVG via any OpenAI-compatible backend — local or remote:

```sh
# local, free (LM Studio on Mac — recommended for testing)
./caratulai.sh generate-svg star water --svg-provider lmstudio --svg-model mistral

# local, free (Ollama — production, CLI-friendly)
./caratulai.sh generate-svg star water --svg-provider ollama --svg-model qwen2.5-coder

# remote (OpenRouter — Grok, Claude, or cheap models)
export SVG_MODEL_API_KEY=sk-or-...
./caratulai.sh generate-svg star water --svg-provider openrouter --svg-model x-ai/grok-2-1212
```

**Backends**: `echo` (placeholder) · `lmstudio` (Mac/Win/Linux GUI) · `ollama` (CLI) · `openrouter` (remote).

**Getting started**:

- **[docs/testing-local-models.md](docs/testing-local-models.md)** — quick start with LM Studio on Mac + recommended models
- **[docs/providers.md](docs/providers.md)** — detailed setup for all backends + OpenRouter API keys

---

## Origin — the founding prompt

Preserved verbatim for historical reasons (the brief that started the project):

> the idea comes from contento/conten.to, simplicity, art like picasso, images in gold plate
> from voyager 1,.
> I'm am not satisfy with the imagery of conten.to: to obvious to colorful! I'd going to create
> a image generator, web front end, TUI CLI, desktop app and backend.
> a generator based on simple concepts, just tags no complex narratives, ontology style with
> simple palettes with minimum colors, BW, sephia, grayscale, 16 bit, 256 but always using
> fundamentals, no rainbows, no rococo or barroco.
> The goal a alien image generator.
> Default generation: force to vector image such as SVG, with export to PDF, JPEG, PNG, ICON,
> etc (suggest). use LLMs from cheap to costly to generate images, use local and remote LLMs.
> Use a lot of metadata, taxonomy and ontology.
> Use both capabilities save in files and or store in DB (SQL LIte, Progress, etc)
> Suggest tools and frameworks. Typescript, Rust, C#, Python, accepted suggestions.
> Multiplatform Windows, Mac, Linux, Web.
> All lines has to be simple not complicated images, arc and diagonal accepted, minimum if not
> zero text
> Ability to show different concepts with different palettes, allow to have max number of ideas
> gen with variations of hyperparameters

### Addendum — 2026-05-31

Another driving idea, preserved verbatim:

> another driving idea: use simple cords A, Am , C#. this is not berlioz, philip glass, more like
> Beatles, Paul Simon, Camilo Sesto, Gardel, Edit Piaf
