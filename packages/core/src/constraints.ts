import type { Constraints } from "./types.js";

/** Default aesthetic constraints: simple lines, arcs, diagonals; no text. */
export const DEFAULT_CONSTRAINTS: Constraints = {
  allowedPrimitives: ["path", "line", "polyline", "polygon", "circle", "ellipse", "rect", "g"],
  maxElements: 24,
  maxTextElements: 0,
  width: 512,
  height: 512,
};
