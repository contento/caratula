/**
 * Default ontology terms for testing.
 * Covers basic concepts across shapes, natural elements, and states.
 */

/** Core concept tags for testing — simple, fundamental, palette-friendly. */
export const DEFAULT_CONCEPTS = {
  // Geometric shapes
  circle: "circle",
  square: "square",
  triangle: "triangle",
  line: "line",

  // Celestial
  star: "star",
  moon: "moon",
  sun: "sun",

  // Natural elements
  water: "water",
  fire: "fire",
  rock: "rock",
  tree: "tree",
  cloud: "cloud",

  // Environments
  sky: "sky",
  ocean: "ocean",
  mountain: "mountain",
  forest: "forest",
  desert: "desert",

  // States & actions
  moving: "moving",
  flying: "flying",
  spinning: "spinning",
  rising: "rising",
  falling: "falling",

  // Misc
  space: "space",
  light: "light",
  shadow: "shadow",
} as const;
