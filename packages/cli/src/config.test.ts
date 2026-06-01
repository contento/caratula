import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { writeFile } from "node:fs/promises";
import { mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { loadDotEnv, resolveOpt } from "./config.js";

describe("config", () => {
  describe("loadDotEnv", () => {
    let tmpDir: string;

    beforeEach(async () => {
      tmpDir = await mkdtemp(join(tmpdir(), "caratulai-test-"));
    });

    afterEach(() => {
      // Clean up env vars we set
      delete process.env.TEST_VAR;
      delete process.env.ANOTHER_VAR;
    });

    it("loads variables from .env file", async () => {
      const envPath = join(tmpDir, ".env");
      await writeFile(envPath, "TEST_VAR=hello\nANOTHER_VAR=world");

      await loadDotEnv(tmpDir);

      expect(process.env.TEST_VAR).toBe("hello");
      expect(process.env.ANOTHER_VAR).toBe("world");
    });

    it("does not override existing env vars", async () => {
      process.env.TEST_VAR = "existing";
      const envPath = join(tmpDir, ".env");
      await writeFile(envPath, "TEST_VAR=new");

      await loadDotEnv(tmpDir);

      expect(process.env.TEST_VAR).toBe("existing");
    });

    it("skips blank lines", async () => {
      const envPath = join(tmpDir, ".env");
      await writeFile(envPath, "TEST_VAR=hello\n\nANOTHER_VAR=world");

      await loadDotEnv(tmpDir);

      expect(process.env.TEST_VAR).toBe("hello");
      expect(process.env.ANOTHER_VAR).toBe("world");
    });

    it("skips comments", async () => {
      const envPath = join(tmpDir, ".env");
      await writeFile(envPath, "# This is a comment\nTEST_VAR=hello\n# Another comment\nANOTHER_VAR=world");

      await loadDotEnv(tmpDir);

      expect(process.env.TEST_VAR).toBe("hello");
      expect(process.env.ANOTHER_VAR).toBe("world");
    });

    it("handles missing .env file gracefully", async () => {
      // loadDotEnv with a directory that has no .env file should not throw
      await expect(loadDotEnv(tmpDir)).resolves.not.toThrow();
    });

    it("trims whitespace around keys and values", async () => {
      const envPath = join(tmpDir, ".env");
      await writeFile(envPath, "  TEST_VAR  =  hello  ");

      await loadDotEnv(tmpDir);

      expect(process.env.TEST_VAR).toBe("hello");
    });
  });

  describe("resolveOpt", () => {
    beforeEach(() => {
      delete process.env.TEST_KEY;
    });

    it("returns CLI value when provided", () => {
      const result = resolveOpt("cli-value", "TEST_KEY", "fallback");
      expect(result).toBe("cli-value");
    });

    it("returns parsed env var when CLI value is undefined", () => {
      process.env.TEST_KEY = "42";
      const result = resolveOpt(undefined, "TEST_KEY", 0, (s) => parseInt(s, 10));
      expect(result).toBe(42);
    });

    it("returns fallback when both CLI and env are undefined", () => {
      const result = resolveOpt(undefined, "TEST_KEY", "fallback");
      expect(result).toBe("fallback");
    });

    it("applies parser to env value", () => {
      process.env.TEST_KEY = "0.5";
      const result = resolveOpt(undefined, "TEST_KEY", 0.7, parseFloat);
      expect(result).toBe(0.5);
    });

    it("returns env var without parser if not provided", () => {
      process.env.TEST_KEY = "env-value";
      const result = resolveOpt(undefined, "TEST_KEY", "fallback");
      expect(result).toBe("env-value");
    });

    it("CLI value takes precedence over env", () => {
      process.env.TEST_KEY = "env-value";
      const result = resolveOpt("cli-value", "TEST_KEY", "fallback");
      expect(result).toBe("cli-value");
    });
  });
});
