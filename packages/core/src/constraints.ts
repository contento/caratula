import type { Constraints } from "./types.js";

/** Restricted set: fundamental shapes only. */
const RESTRICTED_PRIMITIVES = ["path", "line", "polyline", "polygon", "circle", "ellipse", "rect", "g"];

/** Unrestricted: all common SVG drawables. */
const UNRESTRICTED_PRIMITIVES = [
  "path", "line", "polyline", "polygon", "circle", "ellipse", "rect", "g",
  "use", "image", "text", "tspan", "a", "switch"
];

/** Default aesthetic constraints: minimalist but substantive (Voyager Golden Record style). */
export const DEFAULT_CONSTRAINTS: Constraints = {
  allowedPrimitives: UNRESTRICTED_PRIMITIVES,
  maxElements: 48,
  maxTextElements: 2,
  width: 512,
  height: 512,
};

/** Create constraints with optional shape restrictions. */
export function createConstraints(allowAllShapes: boolean = true): Constraints {
  return {
    allowedPrimitives: allowAllShapes ? UNRESTRICTED_PRIMITIVES : RESTRICTED_PRIMITIVES,
    maxElements: 48,
    maxTextElements: 2,
    width: 512,
    height: 512,
  };
}
