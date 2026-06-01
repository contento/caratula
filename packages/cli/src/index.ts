#!/usr/bin/env node
import { writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { Command } from "commander";
import {
  generate,
  extractTags,
  DEFAULT_CONSTRAINTS,
  getPalette,
  BUILTIN_PALETTES,
  type GenerationRequest,
  type LLMProvider,
} from "@caratulai/core";
import { buildProvider } from "./provider-factory.js";
import { fetchTextFromUrl } from "./fetch.js";
import { loadDotEnv, resolveOpt } from "./config.js";

// Load .env variables before parsing CLI flags
await loadDotEnv();

const program = new Command();

program
  .name("caratulai")
  .description("Alien image generator — concepts to simple vector images in fundamental palettes")
  .version("0.0.0");

program
  .command("palettes")
  .description("List built-in fundamental palettes")
  .action(() => {
    for (const p of Object.values(BUILTIN_PALETTES)) {
      console.log(`${p.id.padEnd(12)} ${p.colors.length} colors  ${p.label ?? ""}`);
    }
  });

program
  .command("generate")
  .description("Generate an SVG from concept tags, narrative text, or URL")
  .argument("[tags...]", "concept tags, e.g. star water travel (required unless --from-text or --from-url is used)")
  .option("-p, --palette <id>", "palette id (see `caratulai palettes`)")
  .option("-P, --provider <name>", "llm backend: echo | ollama | lmstudio | openrouter")
  .option("-m, --model <model>", "model id (provider-specific default)")
  .option("--base-url <url>", "override the provider base URL")
  .option("-o, --out <file>", "write SVG to this path instead of stdout")
  .option("-s, --seed <n>", "seed for variation", (v) => parseInt(v, 10), 0)
  .option("-t, --temperature <n>", "sampling temperature", (v) => parseFloat(v))
  .option("--from-text <text>", "extract concept tags from narrative text")
  .option("--from-url <url>", "fetch text from a URL and extract concept tags from it")
  .action(async (tags: string[], opts) => {
    // Resolve config: CLI flags > CARATULAI_* env vars > built-in defaults
    const paletteId = resolveOpt(opts.palette, "CARATULAI_PALETTE", "bw");
    const providerName = resolveOpt(opts.provider, "CARATULAI_PROVIDER", "echo");
    const modelId = resolveOpt(opts.model, "CARATULAI_MODEL", undefined);
    const temperature = resolveOpt(opts.temperature, "CARATULAI_TEMPERATURE", 0.7, parseFloat);

    // Validate that either tags, --from-text, or --from-url is provided.
    const hasPositionalTags = tags && tags.length > 0;
    if (!hasPositionalTags && !opts.fromText && !opts.fromUrl) {
      console.error("Error: provide either positional tags, --from-text <text>, or --from-url <url>");
      process.exitCode = 1;
      return;
    }

    const palette = getPalette(paletteId);
    if (!palette) {
      console.error(`Unknown palette "${paletteId}". Try: ${Object.keys(BUILTIN_PALETTES).join(", ")}`);
      process.exitCode = 1;
      return;
    }

    let provider: LLMProvider;
    try {
      provider = buildProvider({ ...opts, provider: providerName, model: modelId, temperature });
    } catch (err) {
      console.error(err instanceof Error ? err.message : String(err));
      process.exitCode = 1;
      return;
    }

    // Resolve input source: --from-url → --from-text → positional tags
    let finalTags: string[] = [];
    let sourceText: string | null = null;

    if (opts.fromUrl) {
      try {
        sourceText = await fetchTextFromUrl(opts.fromUrl);
        console.error(`Fetched ${sourceText.length} chars from ${opts.fromUrl}`);
      } catch (err) {
        console.error(`Failed to fetch URL: ${err instanceof Error ? err.message : String(err)}`);
        process.exitCode = 1;
        return;
      }
    } else if (opts.fromText) {
      sourceText = opts.fromText;
    }

    if (sourceText) {
      try {
        finalTags = await extractTags(sourceText, provider, {
          model: modelId || provider.models[0],
          temperature,
          seed: opts.seed,
        });
        console.error(`Extracted concepts: ${finalTags.join(", ")}`);
      } catch (err) {
        console.error(`Extraction failed: ${err instanceof Error ? err.message : String(err)}`);
        process.exitCode = 1;
        return;
      }
    } else {
      finalTags = tags || [];
    }

    const req: GenerationRequest = {
      tags: finalTags,
      palette,
      constraints: DEFAULT_CONSTRAINTS,
      params: { model: modelId || provider.models[0], temperature, seed: opts.seed },
    };

    let result;
    try {
      result = await generate(req, provider);
    } catch (err) {
      console.error(`Generation failed via ${provider.name}: ${err instanceof Error ? err.message : String(err)}`);
      if (providerName === "ollama" || providerName === "lmstudio") {
        console.error(`Is the local server running? See docs/providers.md.`);
      }
      process.exitCode = 1;
      return;
    }

    for (const issue of result.report.issues) {
      console.error(`  fixed [${issue.rule}] ${issue.message}`);
    }

    if (opts.out) {
      await mkdir(dirname(opts.out), { recursive: true });
      await writeFile(opts.out, result.svg, "utf8");
      console.error(`Wrote ${opts.out}`);
    } else {
      process.stdout.write(result.svg + "\n");
    }
  });

program.parseAsync().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
