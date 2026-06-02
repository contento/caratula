import { describe, it, expect } from "vitest";
import { DEFAULT_CONSTRAINTS, createConstraints, RESTRICTED_PRIMITIVES, UNRESTRICTED_PRIMITIVES } from "./constraints.js";
import { getProfile } from "./profiles.js";

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

describe("createConstraints", () => {
  it("accepts no arguments and defaults to unrestricted", () => {
    const c = createConstraints();
    expect(c.allowedPrimitives).toBe(UNRESTRICTED_PRIMITIVES);
    expect(c.maxElements).toBe(60);
  });

  it("accepts a boolean for backwards compatibility", () => {
    const unrestricted = createConstraints(true);
    expect(unrestricted.allowedPrimitives).toBe(UNRESTRICTED_PRIMITIVES);

    const restricted = createConstraints(false);
    expect(restricted.allowedPrimitives).toBe(RESTRICTED_PRIMITIVES);
  });

  it("accepts a ProfileDef and applies its constraints", () => {
    const sagan = getProfile("sagan");
    const c = createConstraints(sagan);
    expect(c.maxElements).toBe(sagan.maxElements);
    expect(c.maxTextElements).toBe(sagan.maxTextElements);
    expect(c.allowedPrimitives).toBe(sagan.allowAllShapes ? UNRESTRICTED_PRIMITIVES : RESTRICTED_PRIMITIVES);
  });

  it("contento profile uses all shapes", () => {
    const contento = getProfile("contento");
    const c = createConstraints(contento);
    expect(c.allowedPrimitives).toBe(UNRESTRICTED_PRIMITIVES);
    expect(c.maxElements).toBe(80);
  });
});
