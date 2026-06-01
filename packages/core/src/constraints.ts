import type { Constraints } from "./types.js";

/** Default aesthetic constraints: minimalist but substantive (Voyager Golden Record style). */
export const DEFAULT_CONSTRAINTS: Constraints = {
  allowedPrimitives: ["path", "line", "polyline", "polygon", "circle", "ellipse", "rect", "g"],
  maxElements: 48,
  maxTextElements: 2,
  width: 512,
  height: 512,
};
