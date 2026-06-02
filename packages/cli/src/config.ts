import { readFile } from "node:fs/promises";
import { join } from "node:path";
import yaml from "js-yaml";

/**
 * Load .env file from the given directory (or cwd) and set process.env variables.
 * Skips comments and blank lines. Existing env vars are never overridden.
 * If the file doesn't exist, returns silently (no error).
 */
export async function loadDotEnv(dir: string = process.cwd()): Promise<void> {
  const filePath = join(dir, ".env");
  let content: string;
  try {
    content = await readFile(filePath, "utf-8");
  } catch {
    // .env doesn't exist or can't be read; silently continue
    return;
  }

  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 0) {
      // Invalid line, skip
      continue;
    }

    const key = trimmed.substring(0, eqIdx).trim();
    const value = trimmed.substring(eqIdx + 1).trim();

    // Only set if not already set (env vars take precedence)
    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

/**
 * Resolve a CLI option with three-level priority:
 * 1. Explicit CLI value (if provided)
 * 2. CARATULAI_* env var (if set)
 * 3. Built-in fallback default
 *
 * If a parser is provided, it's applied to the env var before returning.
 */
export function resolveOpt<T>(
  cliValue: T | undefined,
  envKey: string,
  fallback: T,
  parse?: (s: string) => T
): T {
  if (cliValue !== undefined) {
    return cliValue;
  }

  const envValue = process.env[envKey];
  if (envValue !== undefined) {
    return parse ? parse(envValue) : (envValue as unknown as T);
  }

  return fallback;
}

/**
 * Load caratulai.config.yaml from the given directory (or cwd).
 * Returns the parsed YAML as a plain object, or empty object if file doesn't exist.
 */
export async function loadYamlConfig(dir: string = process.cwd()): Promise<Record<string, unknown>> {
  const filePath = join(dir, "caratulai.config.yaml");
  let content: string;
  try {
    content = await readFile(filePath, "utf-8");
  } catch {
    // File doesn't exist or can't be read
    return {};
  }

  try {
    return (yaml.load(content) as Record<string, unknown>) ?? {};
  } catch {
    // Invalid YAML; return empty
    return {};
  }
}

