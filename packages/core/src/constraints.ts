import type { Constraints } from "./types.js";
import type { ProfileDef } from "./profiles.js";
import { getProfile } from "./profiles.js";

export const RESTRICTED_PRIMITIVES = ["path", "line", "polyline", "polygon", "circle", "ellipse", "rect", "g"];

export const UNRESTRICTED_PRIMITIVES = [
  // Basic shapes
  "path", "line", "polyline", "polygon", "circle", "ellipse", "rect",
  // Groups & containers
  "g", "symbol", "defs", "use",
  // Text
  "text", "tspan", "textPath",
  // Media
  "image",
  // Links
  "a",
  // Effects & styling
  "linearGradient", "radialGradient", "pattern", "mask", "clipPath",
  "marker", "filter", "feGaussianBlur", "feOffset", "feBlend",
  // Structural
  "svg", "title", "desc", "metadata"
];

/** Default aesthetic constraints: rich, substantive, meaningful (Voyager Golden Record style). */
export const DEFAULT_CONSTRAINTS: Constraints = {
  allowedPrimitives: UNRESTRICTED_PRIMITIVES,
  maxElements: 60,
  maxTextElements: 0,
  width: 512,
  height: 512,
};

/** Create constraints from a profile. Optionally pass allowAllShapes for backwards compatibility. */
export function createConstraints(profileOrAllShapes?: ProfileDef | boolean): Constraints {
  if (profileOrAllShapes === undefined || typeof profileOrAllShapes === "boolean") {
    const allowAllShapes = profileOrAllShapes ?? true;
    return {
      allowedPrimitives: allowAllShapes ? UNRESTRICTED_PRIMITIVES : RESTRICTED_PRIMITIVES,
      maxElements: 60,
      maxTextElements: 0,
      width: 512,
      height: 512,
    };
  }
  const p = profileOrAllShapes as ProfileDef;
  return {
    allowedPrimitives: p.allowAllShapes ? UNRESTRICTED_PRIMITIVES : RESTRICTED_PRIMITIVES,
    maxElements: p.maxElements,
    maxTextElements: p.maxTextElements,
    width: 512,
    height: 512,
  };
}
