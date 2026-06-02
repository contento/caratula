# Vision

## What is caratulai?

**Carátula** (Spanish): the cover sheet — the first image you meet.

caratulai is an **alien image generator**: it turns *concepts* (tags, not narratives) into **simple vector images** — line, arc, diagonal — in restrained, fundamental palettes.

The lineage is **contento / conten.to**, the **Voyager 1 Golden Record** and Pioneer plaque, and **Picasso's line**. The goal is imagery that feels like a message left for someone who has never seen Earth: fundamental, symbolic, quiet. The reaction against conten.to's current imagery is deliberate — **less obvious, far less colorful.**

## Why the name

**Carátula** is Spanish for the *cover* — the front of a thing. It's what you call the cover of a book, the sleeve of an **LP**, the case of a **CD**, and now the header of a **blog**. The carátula is the first image you meet, the face a work shows the world.

The name is a stance. Generated imagery had become very complex — and as much as I love Bach and computers, I value **simplicity and minimalism** above all. I love a **simple carátula**. This tool exists to make them.

**caratulai** = *carátula* + **AI** — the cover, drawn by a machine.

## The musical analogy

caratulai plays **simple chords — A, Am, C#.** This is *not* Berlioz or Philip Glass; it's the **Beatles, Paul Simon, Camilo Sesto, Gardel, Edith Piaf** — a small vocabulary of familiar forms arranged for directness and feeling. Song-craft, not symphony.

## Goals

- Turn a set of **tags** (drawn from an ontology) into a **simple SVG image**.
- Enforce a **fundamental aesthetic**: minimal palette, simple line/arc/diagonal, little/no text.
- Make every image **reproducible** from its stored metadata (tags, palette, model, params, seed).
- Generate **many variations** of one concept by sweeping hyperparameters.
- Run on **Web, TUI/CLI, Desktop, Backend**, across **Windows/macOS/Linux/Web**.

## Non-goals (v1)

- Diffusion/raster generation as the primary path (optional mode only).
- Full document/body composition — caratulai makes the *image*, not the document.
- WYSIWYG vector editor (it generates; external tools edit).
- Multi-user accounts / collaboration.
- Colorful, ornate, or photorealistic output — out of scope **by design**.

## The founding prompt (2026-05-31)

Preserved verbatim for historical reasons:

> the idea comes from contento/conten.to, simplicity, art like picasso, images in gold plate from voyager 1,.
> I'm am not satisfy with the imagery of conten.to: to obvious to colorful! I'd going to create a image generator, web front end, TUI CLI, desktop app and backend.
> a generator based on simple concepts, just tags no complex narratives, ontology style with simple palettes with minimum colors, BW, sephia, grayscale, 16 bit, 256 but always using fundamentals, no rainbows, no rococo or barroco.
> The goal a alien image generator.
> Default generation: force to vector image such as SVG, with export to PDF, JPEG, PNG, ICON, etc (suggest). use LLMs from cheap to costly to generate images, use local and remote LLMs.
> Use a lot of metadata, taxonomy and ontology.
> Use both capabilities save in files and or store in DB (SQL LIte, Progress, etc)
> Suggest tools and frameworks. Typescript, Rust, C#, Python, accepted suggestions.
> Multiplatform Windows, Mac, Linux, Web.
> All lines has to be simple not complicated images, arc and diagonal accepted, minimum if not zero text
> Ability to show different concepts with different palettes, allow to have max number of ideas gen with variations of hyperparameters

## Addendum (2026-05-31)

Another driving idea, preserved verbatim:

> another driving idea: use simple cords A, Am , C#. this is not berlioz, philip glass, more like Beatles, Paul Simon, Camilo Sesto, Gardel, Edit Piaf
