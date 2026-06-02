import { describe, it, expect } from "vitest";
import { PROFILES, getProfile } from "./profiles.js";
import { getPalette } from "./palettes.js";

describe("profiles", () => {
  it("all profiles are defined for ProfileId type", () => {
    expect(PROFILES.sagan).toBeDefined();
    expect(PROFILES.picasso).toBeDefined();
    expect(PROFILES.contento).toBeDefined();
    expect(PROFILES.dictionary).toBeDefined();
  });

  it("each profile has required fields", () => {
    for (const [id, profile] of Object.entries(PROFILES)) {
      expect(profile.id).toBe(id);
      expect(profile.label).toBeTruthy();
      expect(profile.paletteId).toBeTruthy();
      expect(profile.maxElements).toBeGreaterThan(0);
      expect(profile.maxTextElements).toBeGreaterThanOrEqual(0);
      expect(typeof profile.allowAllShapes).toBe("boolean");
      expect(profile.promptTone).toBeTruthy();
    }
  });

  it("each profile references an existing palette", () => {
    for (const profile of Object.values(PROFILES)) {
      const palette = getPalette(profile.paletteId);
      expect(palette).toBeDefined();
      expect(palette!.colors.length).toBeGreaterThan(0);
    }
  });

  it("getProfile returns the correct profile", () => {
    expect(getProfile("sagan")).toBe(PROFILES.sagan);
    expect(getProfile("picasso")).toBe(PROFILES.picasso);
    expect(getProfile("contento")).toBe(PROFILES.contento);
    expect(getProfile("dictionary")).toBe(PROFILES.dictionary);
  });

  it("getProfile defaults to sagan when no id provided", () => {
    expect(getProfile()).toBe(PROFILES.sagan);
    expect(getProfile(undefined)).toBe(PROFILES.sagan);
  });

  it("sagan has minimal elements and restricted shapes", () => {
    const sagan = PROFILES.sagan;
    expect(sagan.allowAllShapes).toBe(false);
    expect(sagan.maxElements).toBeLessThanOrEqual(48);
  });

  it("contento has maximum elements and all shapes", () => {
    const contento = PROFILES.contento;
    expect(contento.allowAllShapes).toBe(true);
    expect(contento.maxElements).toBeGreaterThan(50);
  });

  it("all profiles have zero text elements", () => {
    for (const profile of Object.values(PROFILES)) {
      expect(profile.maxTextElements).toBe(0);
    }
  });
});
