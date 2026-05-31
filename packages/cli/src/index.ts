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
  createOllamaProvider,
  createLMStudioProvider,
  createOpenRouterProvider,
  type GenerationRequest,
  type LLMProvider,
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

/** Construct an LLM provider from the CLI options. See docs/providers.md. */
function buildProvider(opts: { provider: string; model?: string; baseUrl?: string }): LLMProvider {
  switch (opts.provider) {
    case "echo":
      return new EchoProvider();
    case "ollama":
      return createOllamaProvider({ model: opts.model, baseUrl: opts.baseUrl });
    case "lmstudio":
      return createLMStudioProvider({ model: opts.model, baseUrl: opts.baseUrl });
    case "openrouter":
      return createOpenRouterProvider({
        model: opts.model,
        baseUrl: opts.baseUrl,
        apiKey: process.env.OPENROUTER_API_KEY ?? "",
        referer: "https://github.com/contento/caratula",
        title: "caratula",
      });
    default:
      throw new Error(
        `Unknown provider "${opts.provider}". Use: echo | ollama | lmstudio | openrouter.`
      );
  }
}

program
  .command("generate")
  .description("Generate an SVG from concept tags")
  .argument("<tags...>", "concept tags, e.g. star water travel")
  .option("-p, --palette <id>", "palette id (see `caratula palettes`)", "bw")
  .option("-P, --provider <name>", "llm backend: echo | ollama | lmstudio | openrouter", "echo")
  .option("-m, --model <model>", "model id (provider-specific default)")
  .option("--base-url <url>", "override the provider base URL")
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

    let provider: LLMProvider;
    try {
      provider = buildProvider(opts);
    } catch (err) {
      console.error(err instanceof Error ? err.message : String(err));
      process.exitCode = 1;
      return;
    }

    const req: GenerationRequest = {
      tags,
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
