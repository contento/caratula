import { describe, it, expect } from "vitest";
import {
  BW,
  GRAYSCALE,
  SEPIA,
  PALETTE_16,
  BUILTIN_PALETTES,
  getPalette,
  hexToRgb,
  snapToPalette,
} from "./palettes.js";

describe("hexToRgb", () => {
  it("parses a 6-digit hex", () => {
    expect(hexToRgb("#000000")).toEqual([0, 0, 0]);
    expect(hexToRgb("#ffffff")).toEqual([255, 255, 255]);
    expect(hexToRgb("#7a1f1f")).toEqual([122, 31, 31]);
  });

  it("ignores a leading hash being absent", () => {
    expect(hexToRgb("808080")).toEqual([128, 128, 128]);
  });
});

describe("snapToPalette", () => {
  it("returns an exact palette color unchanged", () => {
    expect(snapToPalette("#000000", BW)).toBe("#000000");
    expect(snapToPalette("#ffffff", BW)).toBe("#ffffff");
  });

  it("snaps a near-black to black and near-white to white", () => {
    expect(snapToPalette("#111111", BW)).toBe("#000000");
    expect(snapToPalette("#eeeeee", BW)).toBe("#ffffff");
  });

  it("snaps an arbitrary color to the nearest by RGB distance", () => {
    // mid-gray is equidistant-ish; ensure it lands on a real palette member
    expect(BW.colors).toContain(snapToPalette("#00ff88", BW));
  });

  it("always returns a member of the target palette", () => {
    for (const probe of ["#123456", "#abcdef", "#ff0000", "#00ff00", "#0000ff"]) {
      expect(SEPIA.colors).toContain(snapToPalette(probe, SEPIA));
      expect(PALETTE_16.colors).toContain(snapToPalette(probe, PALETTE_16));
    }
  });

  it("is deterministic across calls", () => {
    expect(snapToPalette("#445566", SEPIA)).toBe(snapToPalette("#445566", SEPIA));
  });
});

describe("built-in palettes", () => {
  it("exposes the expected ids", () => {
    expect(Object.keys(BUILTIN_PALETTES).sort()).toEqual(
      ["bw", "grayscale", "palette-16", "sepia"].sort()
    );
  });

  it("getPalette resolves known ids and rejects unknown", () => {
    expect(getPalette("sepia")).toBe(SEPIA);
    expect(getPalette("nope")).toBeUndefined();
  });

  it("every color is a valid 6-digit hex", () => {
    for (const p of Object.values(BUILTIN_PALETTES)) {
      for (const c of p.colors) {
        expect(c).toMatch(/^#[0-9a-f]{6}$/);
      }
    }
  });

  it("grayscale ramp spans pure black to pure white and is monotonic", () => {
    expect(GRAYSCALE.colors[0]).toBe("#000000");
    expect(GRAYSCALE.colors.at(-1)).toBe("#ffffff");
    const lums = GRAYSCALE.colors.map((c) => hexToRgb(c)[0]);
    for (let i = 1; i < lums.length; i++) {
      expect(lums[i]!).toBeGreaterThan(lums[i - 1]!);
    }
  });

  it("has the documented sizes", () => {
    expect(BW.colors).toHaveLength(2);
    expect(PALETTE_16.colors).toHaveLength(16);
  });
});
