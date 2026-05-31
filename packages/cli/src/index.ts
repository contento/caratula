#!/usr/bin/env node
import { writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { Command } from "commander";
import {
  generate,
  DEFAULT_CONSTRAINTS,
  getPalette,
  BUILTIN_PALETTES,
  EchoProvider,
  type GenerationRequest,
} from "@caratula/core";

const program = new Command();

program
  .name("caratula")
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
  .description("Generate an SVG from concept tags")
  .argument("<tags...>", "concept tags, e.g. star water travel")
  .option("-p, --palette <id>", "palette id (see `caratula palettes`)", "bw")
  .option("-o, --out <file>", "write SVG to this path instead of stdout")
  .option("-s, --seed <n>", "seed for variation", (v) => parseInt(v, 10), 0)
  .option("-t, --temperature <n>", "sampling temperature", (v) => parseFloat(v), 0.7)
  .action(async (tags: string[], opts) => {
    const palette = getPalette(opts.palette);
    if (!palette) {
      console.error(`Unknown palette "${opts.palette}". Try: ${Object.keys(BUILTIN_PALETTES).join(", ")}`);
      process.exitCode = 1;
      return;
    }

    const req: GenerationRequest = {
      tags,
      palette,
      constraints: DEFAULT_CONSTRAINTS,
      params: { model: "echo-1", temperature: opts.temperature, seed: opts.seed },
    };

    // TODO: build the model ladder from config/env (Ollama → Anthropic → ...).
    const provider = new EchoProvider();
    const result = await generate(req, provider);

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
