# 0001 — Images are LLM-generated SVG, not diffusion raster

- Status: accepted
- Date: 2026-05-31

## Context

caratula's aesthetic is vector-native and symbolic: Voyager Golden Record / Pioneer plaque,
Picasso line, tags-not-narratives, fundamental palettes, arcs and diagonals, little/no text.
Diffusion image models (Stable Diffusion, DALL·E, etc.) produce raster output, are hard to
constrain to a fixed palette, and tend toward exactly the colorful/ornate noise we reject.

## Decision

The core generation path is an **LLM emitting SVG as text**, constrained by a prompt built from
tags + palette + aesthetic rules, then passed through a validator/sanitizer that enforces palette,
allowed primitives, and complexity limits.

## Consequences

- Palette is guaranteed via post-process color-snapping; vectors are clean and scalable.
- Iteration is cheap (text generation) and reproducible from stored params.
- Quality depends on model SVG ability — hence a model ladder (cheap/local → costly/remote).
- Diffusion remains a possible **opt-in mode** later, not the default. See [0002](0002-typescript-monorepo.md).
