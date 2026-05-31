import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/index.ts"],
      // Strictness: the engine is the source of truth for the aesthetic — keep it covered.
      thresholds: {
        statements: 98,
        branches: 95,
        functions: 100,
        lines: 98,
      },
    },
  },
});
