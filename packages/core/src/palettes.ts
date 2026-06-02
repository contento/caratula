import type { Palette } from "./types.js";

/**
 * Built-in fundamental palettes — the source of truth for caratulai's color discipline.
 * Restrained hue, earth/primary tones. No rainbows, no neon.
 */

const grayscaleRamp = (steps: number): string[] =>
  Array.from({ length: steps }, (_, i) => {
    const v = Math.round((i / (steps - 1)) * 255);
    const h = v.toString(16).padStart(2, "0");
    return `#${h}${h}${h}`;
  });

export const BW: Palette = {
  id: "bw",
  kind: "bw",
  label: "Black & White",
  colors: ["#ffffff", "#000000"],
};

export const GRAYSCALE: Palette = {
  id: "grayscale",
  kind: "grayscale",
  label: "Grayscale",
  colors: grayscaleRamp(9),
};

export const SEPIA: Palette = {
  id: "sepia",
  kind: "sepia",
  label: "Sepia",
  colors: ["#f4ecd8", "#d8c3a0", "#b39768", "#8a6d3b", "#5c4326", "#2e2113"],
};

/** Fundamental 16 — muted earth/primary tones, deliberately not a full spectrum. */
export const PALETTE_16: Palette = {
  id: "palette-16",
  kind: "palette-16",
  label: "Fundamental 16",
  colors: [
    "#f4ecd8", "#1a1a1a", "#7a1f1f", "#2f4a3f",
    "#2a3d5c", "#8a6d3b", "#5c4326", "#9aa39a",
    "#3f3f3f", "#b34a2f", "#46685b", "#586b8a",
    "#c9b27c", "#6e6e6e", "#7d2e3a", "#d8c3a0",
  ],
};

/** Sagan: Voyager Golden Record palette — gold background + silver foreground + supporting earth tones. */
export const PALETTE_SAGAN: Palette = {
  id: "sagan",
  kind: "palette-16",
  label: "Voyager Golden Record",
  colors: [
    "#d4af37", "#c0c0c0", "#b8960c", "#e8d5a3", "#f5e6aa",
    "#a8a8a8", "#808080", "#f0f0f0", "#2c2c2c", "#1a1a1a",
  ],
};

/** Extended palette: 256 curated colors — earth tones, grays, muted blues/greens, rust accents. */
export const PALETTE_256: Palette = {
  id: "palette-256",
  kind: "palette-256",
  label: "Extended 256-color",
  colors: [
    // Grays and neutrals (0–15)
    "#ffffff", "#f5f5f5", "#e8e8e8", "#d4d4d4", "#c0c0c0", "#b0b0b0", "#808080", "#696969",
    "#505050", "#3a3a3a", "#2c2c2c", "#1a1a1a", "#0f0f0f", "#000000", "#e0e0e0", "#a9a9a9",
    // Earth tones (16–47)
    "#f4ecd8", "#d8c3a0", "#c9b27c", "#b39768", "#a89a5e", "#8a6d3b", "#7a5c2f", "#5c4326",
    "#4a3318", "#2e2113", "#f5e6aa", "#e8d5a3", "#d9c791", "#c9b27c", "#b8960c", "#a67c52",
    "#8b6f47", "#6b5d47", "#5a4a3a", "#4a3a2a", "#d4af37", "#c29b1f", "#b8860b", "#a0730d",
    "#905010", "#7a4410", "#6a3410", "#5a2410",
    // Muted blues (48–79)
    "#e6f2ff", "#d4e6ff", "#b3d9ff", "#8fc7ff", "#6ba3e8", "#4a7bd4", "#2a5fc9", "#0052b3",
    "#003d99", "#002966", "#1e4d7b", "#2a5f8d", "#3a7ba6", "#4a9bc9", "#5aaadc", "#2a5f99",
    "#1a4d7b", "#0a3d6b", "#3a6b99", "#4a7baa", "#1a6b99", "#0a5b8b", "#003d7a", "#002966",
    "#4a8fd9", "#6baae8", "#8ab8ff", "#a3c9ff", "#b8d9ff", "#cce8ff", "#ddf2ff", "#eef7ff",
    // Muted greens (80–111)
    "#e6f5e6", "#d4e8d4", "#b8d9b8", "#9ac99a", "#7ab87a", "#5aa85a", "#3a9a3a", "#1a8a1a",
    "#0a7a0a", "#006a00", "#004a00", "#003a00", "#2f4a3f", "#3a5a4a", "#4a6a5a", "#5a7a6a",
    "#6a8a7a", "#7a9a8a", "#8aaa9a", "#9abaaa", "#46685b", "#56785b", "#668a6b", "#769a7b",
    "#86aa8b", "#96ba9b", "#a6caab", "#b6dabb", "#4a8a5a", "#5a9a6a", "#6aaa7a", "#7aba8a",
    // Rust and earth accents (112–143)
    "#b34a2f", "#a63d22", "#9a3015", "#8a2010", "#7a1810", "#6a1008", "#7a1f1f", "#9a3030",
    "#b34040", "#c95050", "#d96060", "#c97552", "#d9854a", "#e59540", "#d08a3a", "#c97a2a",
    "#b86a1a", "#a85a0a", "#e8a070", "#f0b080", "#f8c090", "#e89a60", "#d88a40", "#c87a20",
    "#a0730d", "#905010", "#7a4410", "#6a3410", "#d9c791", "#c9b27c", "#b8960c", "#a89a5e",
    "#8a6d3b", "#7a5c2f", "#5c4326", "#4a3318",
    // Support colors (144–255) — more grays and variants
    ...grayscaleRamp(112).slice(0, 112),
  ],
};

export const BUILTIN_PALETTES: Record<string, Palette> = {
  [BW.id]: BW,
  [GRAYSCALE.id]: GRAYSCALE,
  [SEPIA.id]: SEPIA,
  [PALETTE_16.id]: PALETTE_16,
  [PALETTE_SAGAN.id]: PALETTE_SAGAN,
  [PALETTE_256.id]: PALETTE_256,
};

export function getPalette(id: string): Palette | undefined {
  return BUILTIN_PALETTES[id];
}

/** Parse "#rrggbb" to [r,g,b]. */
export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/** Nearest palette color to an arbitrary hex, by squared RGB distance. */
export function snapToPalette(hex: string, palette: Palette): string {
  const [r, g, b] = hexToRgb(hex);
  let best = palette.colors[0]!;
  let bestDist = Infinity;
  for (const c of palette.colors) {
    const [cr, cg, cb] = hexToRgb(c);
    const d = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return best;
}
