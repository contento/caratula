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

/** Generate timestamped filename: yyyyMMdd_HHmmssSSS.svg */
function generateTimestampFilename(dir: string): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const MM = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const HH = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  const SSS = String(now.getMilliseconds()).padStart(3, "0");
  const filename = `${yyyy}${MM}${dd}_${HH}${mm}${ss}${SSS}.svg`;
  return `${dir}/${filename}`;
}

/** Aspect ratio presets. */
const RATIO_PRESETS: Record<string, [number, number]> = {
  square: [512, 512],
  "1:1": [512, 512],
  "16:9": [960, 540],
  "9:16": [540, 960],
  "4:3": [640, 480],
  "3:4": [480, 640],
  "21:9": [1024, 438],
  "9:21": [438, 1024],
};

function resolveRatio(ratioStr: string | undefined): [number, number] {
  if (!ratioStr) return [512, 512];
  const preset = RATIO_PRESETS[ratioStr.toLowerCase()];
  if (preset) return preset;
  // Try parsing custom ratio like "16:9"
  const match = ratioStr.match(/^(\d+):(\d+)$/);
  if (match && match[1] && match[2]) {
    const w = Number(match[1]);
    const h = Number(match[2]);
    const scale = 512 / w;
    return [Math.round(w * scale), Math.round(h * scale)];
  }
  return [512, 512];
}

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
  .argument("[tags...]", "concept tags (e.g. star water travel), or use CARATULAI_DEFAULT_TAGS from .env")
  .option("-p, --palette <id>", "palette id (see `caratulai palettes`)")
  .option("--svg-provider <name>", "llm backend for SVG generation (echo | ollama | lmstudio | openrouter)")
  .option("--svg-model <model>", "model for SVG generation (must be good at code generation)")
  .option("--base-url <url>", "override the provider base URL")
  .option("-o, --out <file>", "write SVG to this path instead of stdout")
  .option("-s, --seed <n>", "seed for variation", (v) => parseInt(v, 10), 1)
  .option("-t, --temperature <n>", "sampling temperature", (v) => parseFloat(v))
  .option("--ratio <preset>", "aspect ratio preset: square, 16:9, 4:3, 21:9, 9:16, 3:4, or custom like 16:9")
  .option("--width <n>", "canvas width (overrides --ratio)", (v) => parseInt(v, 10))
  .option("--height <n>", "canvas height (overrides --ratio)", (v) => parseInt(v, 10))
  .action(async (tags: string[], opts) => {
    // Use provided tags or fall back to CARATULAI_DEFAULT_TAGS from env
    const finalTags = (tags && tags.length > 0) ? tags : (process.env.CARATULAI_DEFAULT_TAGS?.split(",").map(t => t.trim()) || []);

    // Resolve canvas dimensions: --width/--height > --ratio > CARATULAI_RATIO env > default
    let width = 512, height = 512;
    if (opts.width || opts.height) {
      width = opts.width || 512;
      height = opts.height || 512;
    } else {
      const ratioOpt = opts.ratio || process.env.CARATULAI_RATIO || "16:9";
      [width, height] = resolveRatio(ratioOpt);
    }

    if (!finalTags || finalTags.length === 0) {
      console.error("Error: provide tags or set CARATULAI_DEFAULT_TAGS in .env");
      process.exitCode = 1;
      return;
    }

    const paletteId = resolveOpt(opts.palette, "CARATULAI_PALETTE", "bw");
    const temperature = resolveOpt(opts.temperature, "CARATULAI_TEMPERATURE", 0.7, parseFloat);
    const svgProviderName = resolveOpt(opts.svgProvider, "CARATULAI_SVG_PROVIDER", "echo");
    const svgModelId = resolveOpt(opts.svgModel, "CARATULAI_SVG_MODEL", undefined);

    console.error(`[DEBUG] SVG: ${svgProviderName}/${svgModelId || "(default)"}`);


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
      tags: finalTags,
      palette,
      constraints: { ...DEFAULT_CONSTRAINTS, width, height },
      params: { model: svgModelId || svgProvider.models[0], temperature, seed: opts.seed },
    };

    let result;
    try {
      result = await generate(req, svgProvider);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(`Generation failed via ${svgProvider.name}:`);
      console.error(`  ${errorMsg}`);
      if (svgProviderName === "openrouter") {
        console.error(`  Check: API key valid? Rate limited? Model exists?`);
        console.error(`  API Key: ${process.env.OPENROUTER_API_KEY ? "set" : "NOT SET"}`);
      }
      if (svgProviderName === "ollama" || svgProviderName === "lmstudio") {
        console.error(`Is the local server running? See docs/providers.md.`);
      }
      process.exitCode = 1;
      return;
    }

    for (const issue of result.report.issues) {
      console.error(`  fixed [${issue.rule}] ${issue.message}`);
    }

    const outPath = opts.out || (process.env.CARATULAI_AUTO_SAVE_DIR ? generateTimestampFilename(process.env.CARATULAI_AUTO_SAVE_DIR) : null);

    if (outPath) {
      await mkdir(dirname(outPath), { recursive: true });
      await writeFile(outPath, result.svg, "utf8");
      console.error(`Wrote ${outPath}`);
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
  .option("-s, --seed <n>", "seed for variation", (v) => parseInt(v, 10), 1)
  .option("-t, --temperature <n>", "sampling temperature", (v) => parseFloat(v))
  .option("--ratio <preset>", "aspect ratio preset: square, 16:9, 4:3, 21:9, 9:16, 3:4, or custom like 16:9")
  .option("--width <n>", "canvas width (overrides --ratio)", (v) => parseInt(v, 10))
  .option("--height <n>", "canvas height (overrides --ratio)", (v) => parseInt(v, 10))
  .option("--from-text <text>", "extract concept tags from narrative text")
  .option("--from-url <url>", "fetch text from a URL and extract concept tags from it")
  .action(async (tags: string[], opts) => {
    // Resolve config: CLI flags > CARATULAI_* env vars > built-in defaults
    const paletteId = resolveOpt(opts.palette, "CARATULAI_PALETTE", "bw");

    // Resolve canvas dimensions: --width/--height > --ratio > CARATULAI_RATIO env > default
    let width = 512, height = 512;
    if (opts.width || opts.height) {
      width = opts.width || 512;
      height = opts.height || 512;
    } else {
      const ratioOpt = opts.ratio || process.env.CARATULAI_RATIO || "16:9";
      [width, height] = resolveRatio(ratioOpt);
    }
    const temperature = resolveOpt(opts.temperature, "CARATULAI_TEMPERATURE", 0.7, parseFloat);

    // Text model (extraction from narrative text)
    const textProviderName = resolveOpt(opts.textProvider, "CARATULAI_TEXT_PROVIDER", "echo");
    const textModelId = resolveOpt(opts.textModel, "CARATULAI_TEXT_MODEL", undefined);

    // SVG model (generation from tags)
    const svgProviderName = resolveOpt(opts.svgProvider, "CARATULAI_SVG_PROVIDER", "echo");
    const svgModelId = resolveOpt(opts.svgModel, "CARATULAI_SVG_MODEL", undefined);

    console.error(`[DEBUG] TEXT: ${textProviderName}/${textModelId || "(default)"}  SVG: ${svgProviderName}/${svgModelId || "(default)"}`);

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
      constraints: { ...DEFAULT_CONSTRAINTS, width, height },
      params: { model: svgModelId || svgProvider.models[0], temperature, seed: opts.seed },
    };

    let result;
    try {
      result = await generate(req, svgProvider);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(`Generation failed via ${svgProvider.name}:`);
      console.error(`  ${errorMsg}`);
      if (svgProviderName === "openrouter") {
        console.error(`  Check: API key valid? Rate limited? Model exists?`);
        console.error(`  API Key: ${process.env.OPENROUTER_API_KEY ? "set" : "NOT SET"}`);
      }
      if (svgProviderName === "ollama" || svgProviderName === "lmstudio") {
        console.error(`Is the local server running? See docs/providers.md.`);
      }
      process.exitCode = 1;
      return;
    }

    for (const issue of result.report.issues) {
      console.error(`  fixed [${issue.rule}] ${issue.message}`);
    }

    const outPath = opts.out || (process.env.CARATULAI_AUTO_SAVE_DIR ? generateTimestampFilename(process.env.CARATULAI_AUTO_SAVE_DIR) : null);

    if (outPath) {
      await mkdir(dirname(outPath), { recursive: true });
      await writeFile(outPath, result.svg, "utf8");
      console.error(`Wrote ${outPath}`);
    } else {
      process.stdout.write(result.svg + "\n");
    }
  });

program.parseAsync().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
