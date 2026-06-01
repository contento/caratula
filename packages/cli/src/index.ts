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
  .description("Generate an SVG from concept tags or narrative text")
  .argument("[tags...]", "concept tags, e.g. star water travel (required unless --from-text is used)")
  .option("-p, --palette <id>", "palette id (see `caratulai palettes`)", "bw")
  .option("-P, --provider <name>", "llm backend: echo | ollama | lmstudio | openrouter", "echo")
  .option("-m, --model <model>", "model id (provider-specific default)")
  .option("--base-url <url>", "override the provider base URL")
  .option("-o, --out <file>", "write SVG to this path instead of stdout")
  .option("-s, --seed <n>", "seed for variation", (v) => parseInt(v, 10), 0)
  .option("-t, --temperature <n>", "sampling temperature", (v) => parseFloat(v), 0.7)
  .option("--from-text <text>", "extract concept tags from narrative text instead of using positional tags")
  .action(async (tags: string[], opts) => {
    // Validate that either tags or --from-text is provided.
    if ((!tags || tags.length === 0) && !opts.fromText) {
      console.error("Error: provide either positional tags or --from-text <text>");
      process.exitCode = 1;
      return;
    }

    const palette = getPalette(opts.palette);
    if (!palette) {
      console.error(`Unknown palette "${opts.palette}". Try: ${Object.keys(BUILTIN_PALETTES).join(", ")}`);
      process.exitCode = 1;
      return;
    }

    let provider: LLMProvider;
    try {
      provider = buildProvider(opts);
    } catch (err) {
      console.error(err instanceof Error ? err.message : String(err));
      process.exitCode = 1;
      return;
    }

    // Extract tags from text if --from-text is provided; otherwise use positional tags.
    let finalTags = tags || [];
    if (opts.fromText) {
      try {
        finalTags = await extractTags(opts.fromText, provider, {
          model: provider.models[0] ?? opts.provider,
          temperature: opts.temperature,
          seed: opts.seed,
        });
        console.error(`Extracted concepts: ${finalTags.join(", ")}`);
      } catch (err) {
        console.error(`Extraction failed: ${err instanceof Error ? err.message : String(err)}`);
        process.exitCode = 1;
        return;
      }
    }

    const req: GenerationRequest = {
      tags: finalTags,
      palette,
      constraints: DEFAULT_CONSTRAINTS,
      params: { model: provider.models[0] ?? opts.provider, temperature: opts.temperature, seed: opts.seed },
    };

    let result;
    try {
      result = await generate(req, provider);
    } catch (err) {
      console.error(`Generation failed via ${provider.name}: ${err instanceof Error ? err.message : String(err)}`);
      if (opts.provider === "ollama" || opts.provider === "lmstudio") {
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
