# Contributing to caratulai

Thanks for your interest! caratulai is an alien image generator — concepts to simple vector images in fundamental palettes. Before contributing, skim [[01-Vision]] and [[02-Principles]] to absorb the aesthetic; it is enforced, not optional.

## Development setup

Requires Node ≥ 20 and pnpm (`corepack enable pnpm`).

```sh
pnpm install
pnpm build        # build all packages
pnpm typecheck    # type-check without emitting

# run the CLI
node packages/cli/dist/index.js palettes
node packages/cli/dist/index.js generate star water travel --palette sepia --out out/idea.svg
```

## Project layout

- `packages/core` — the engine (ontology, palettes, prompt builder, providers, SVG validator). Stays I/O-agnostic: no direct DB/filesystem here.
- `packages/cli` — command-line interface over the engine.

There is a knowledge graph in `graphify-out/` (regenerated, not committed). After changing code, run `graphify update .` if you have graphify installed.

## Conventions

- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/) — `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`. Keep them small and focused.
- **Code:** ESM TypeScript, `@caratulai/<name>` scope. Match the surrounding style.
- **Aesthetic:** any change to generation must keep output passing the validator — fundamental palettes only, simple primitives, little/no text. See [[02-Principles]].
- **Decisions:** record non-obvious choices as short ADRs in `wiki/decisions/`.

## Pull requests

1. Branch off `main`.
2. Make sure `pnpm build` and `pnpm typecheck` pass.
3. Open a PR describing the change and linking any related issue.

## Releases

Releases are tag-driven: pushing a `vX.Y.Z` tag triggers the release workflow, which builds and publishes a GitHub Release with auto-generated notes. See [[decisions/ADR-0003 Versioning]] for the versioning policy.

## See Also

- [[04-Stack]] — tech stack and architecture
- [[17-Roadmap]] — milestones and what's next
- [[02-Principles]] — the aesthetic constraints (required reading)
