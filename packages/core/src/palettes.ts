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

export const BUILTIN_PALETTES: Record<string, Palette> = {
  [BW.id]: BW,
  [GRAYSCALE.id]: GRAYSCALE,
  [SEPIA.id]: SEPIA,
  [PALETTE_16.id]: PALETTE_16,
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
