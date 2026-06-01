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
  .command("generate-svg")
  .description("Generate SVG directly from concept tags (no extraction)")
  .argument("<tags...>", "concept tags, e.g. star water travel")
  .option("-p, --palette <id>", "palette id (see `caratulai palettes`)")
  .option("--svg-provider <name>", "llm backend for SVG generation (echo | ollama | lmstudio | openrouter)")
  .option("--svg-model <model>", "model for SVG generation (must be good at code generation)")
  .option("--base-url <url>", "override the provider base URL")
  .option("-o, --out <file>", "write SVG to this path instead of stdout")
  .option("-s, --seed <n>", "seed for variation", (v) => parseInt(v, 10), 0)
  .option("-t, --temperature <n>", "sampling temperature", (v) => parseFloat(v))
  .action(async (tags: string[], opts) => {
    const paletteId = resolveOpt(opts.palette, "CARATULAI_PALETTE", "bw");
    const temperature = resolveOpt(opts.temperature, "CARATULAI_TEMPERATURE", 0.7, parseFloat);
    const svgProviderName = resolveOpt(opts.svgProvider, "CARATULAI_SVG_PROVIDER", "echo");
    const svgModelId = resolveOpt(opts.svgModel, "CARATULAI_SVG_MODEL", undefined);

    const palette = getPalette(paletteId);
    if (!palette) {
      console.error(`Unknown palette "${paletteId}". Try: ${Object.keys(BUILTIN_PALETTES).join(", ")}`);
      process.exitCode = 1;
      return;
    }

    let svgProvider: LLMProvider;
    try {
      svgProvider = buildProvider({ ...opts, provider: svgProviderName, model: svgModelId, temperature });
    } catch (err) {
      console.error(err instanceof Error ? err.message : String(err));
      process.exitCode = 1;
      return;
    }

    const req: GenerationRequest = {
      tags,
      palette,
      constraints: DEFAULT_CONSTRAINTS,
      params: { model: svgModelId || svgProvider.models[0], temperature, seed: opts.seed },
    };

    let result;
    try {
      result = await generate(req, svgProvider);
    } catch (err) {
      console.error(`Generation failed via ${svgProvider.name}: ${err instanceof Error ? err.message : String(err)}`);
      if (svgProviderName === "ollama" || svgProviderName === "lmstudio") {
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

program
  .command("generate")
  .description("Generate an SVG from concept tags, narrative text, or URL")
  .argument("[tags...]", "concept tags, e.g. star water travel (required unless --from-text or --from-url is used)")
  .option("-p, --palette <id>", "palette id (see `caratulai palettes`)")
  .option("--text-provider <name>", "llm backend for text extraction (echo | ollama | lmstudio | openrouter)")
  .option("--text-model <model>", "model for text extraction")
  .option("--svg-provider <name>", "llm backend for SVG generation (echo | ollama | lmstudio | openrouter)")
  .option("--svg-model <model>", "model for SVG generation (must be good at code generation)")
  .option("--image-provider <name>", "llm backend for image reading [future: M6]")
  .option("--image-model <model>", "model for image reading [future: M6]")
  .option("--base-url <url>", "override the provider base URL")
  .option("-o, --out <file>", "write SVG to this path instead of stdout")
  .option("-s, --seed <n>", "seed for variation", (v) => parseInt(v, 10), 0)
  .option("-t, --temperature <n>", "sampling temperature", (v) => parseFloat(v))
  .option("--from-text <text>", "extract concept tags from narrative text")
  .option("--from-url <url>", "fetch text from a URL and extract concept tags from it")
  .action(async (tags: string[], opts) => {
    // Resolve config: CLI flags > CARATULAI_* env vars > built-in defaults
    const paletteId = resolveOpt(opts.palette, "CARATULAI_PALETTE", "bw");
    const temperature = resolveOpt(opts.temperature, "CARATULAI_TEMPERATURE", 0.7, parseFloat);

    // Text model (extraction from narrative text)
    const textProviderName = resolveOpt(opts.textProvider, "CARATULAI_TEXT_PROVIDER", "echo");
    const textModelId = resolveOpt(opts.textModel, "CARATULAI_TEXT_MODEL", undefined);

    // SVG model (generation from tags)
    const svgProviderName = resolveOpt(opts.svgProvider, "CARATULAI_SVG_PROVIDER", "echo");
    const svgModelId = resolveOpt(opts.svgModel, "CARATULAI_SVG_MODEL", undefined);

    // Image model (reading images - future: M6)
    const imageProviderName = resolveOpt(opts.imageProvider, "CARATULAI_IMAGE_PROVIDER", undefined);
    const imageModelId = resolveOpt(opts.imageModel, "CARATULAI_IMAGE_MODEL", undefined);

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

    // Build SVG generation provider
    let svgProvider: LLMProvider;
    try {
      svgProvider = buildProvider({ ...opts, provider: svgProviderName, model: svgModelId, temperature });
    } catch (err) {
      console.error(err instanceof Error ? err.message : String(err));
      process.exitCode = 1;
      return;
    }

    // Build text extraction provider (or reuse SVG provider if same)
    let textProvider: LLMProvider;
    if (textProviderName === svgProviderName && textModelId === svgModelId) {
      textProvider = svgProvider;
    } else {
      try {
        textProvider = buildProvider({
          ...opts,
          provider: textProviderName,
          model: textModelId,
          temperature,
        });
      } catch (err) {
        console.error(err instanceof Error ? err.message : String(err));
        process.exitCode = 1;
        return;
      }
    }

    // Image provider (for future M6: caratulize)
    // TODO: implement image input support
    // let imageProvider: LLMProvider;
    // if (imageProviderName && imageModelId) {
    //   try {
    //     imageProvider = buildProvider({
    //       ...opts,
    //       provider: imageProviderName,
    //       model: imageModelId,
    //       temperature,
    //     });
    //   } catch (err) {
    //     // image input not yet implemented
    //   }
    // }

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
        finalTags = await extractTags(sourceText, textProvider, {
          model: textModelId || textProvider.models[0],
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
      params: { model: svgModelId || svgProvider.models[0], temperature, seed: opts.seed },
    };

    let result;
    try {
      result = await generate(req, svgProvider);
    } catch (err) {
      console.error(`Generation failed via ${svgProvider.name}: ${err instanceof Error ? err.message : String(err)}`);
      if (svgProviderName === "ollama" || svgProviderName === "lmstudio") {
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
