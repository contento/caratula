import { describe, it, expect } from "vitest";
import { DEFAULT_CONSTRAINTS } from "./constraints.js";

describe("DEFAULT_CONSTRAINTS", () => {
  it("forbids text by default", () => {
    expect(DEFAULT_CONSTRAINTS.maxTextElements).toBe(0);
  });

  it("allows the fundamental primitives", () => {
    expect(DEFAULT_CONSTRAINTS.allowedPrimitives).toEqual(expect.arrayContaining(["path", "line"]));
  });

  it("has a positive canvas and a complexity cap", () => {
    expect(DEFAULT_CONSTRAINTS.width).toBeGreaterThan(0);
    expect(DEFAULT_CONSTRAINTS.height).toBeGreaterThan(0);
    expect(DEFAULT_CONSTRAINTS.maxElements).toBeGreaterThan(0);
  });
});
