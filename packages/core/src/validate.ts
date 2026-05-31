import { parse, type HTMLElement } from "node-html-parser";
import type { Constraints, Palette, ValidationIssue, ValidationReport } from "./types.js";
import { snapToPalette } from "./palettes.js";

/** Strip markdown fences / prose an LLM may wrap around the SVG. */
export function extractSvg(raw: string): string {
  const match = raw.match(/<svg[\s\S]*<\/svg>/i);
  return match ? match[0] : raw.trim();
}

// Matches both CSS (`fill:#fff`) and attribute (`fill="#fff"`) forms, capturing the separator
// and optional quote so they can be preserved on replacement.
const FILL_STROKE = /(fill|stroke)(\s*[:=]\s*)(["']?)(#[0-9a-fA-F]{3,6})/g;

/**
 * Enforce the aesthetic on a generated SVG: snap colors to the palette, drop disallowed
 * elements, cap complexity, and remove text beyond the limit. Returns the cleaned SVG and a
 * report of what was changed.
 */
export function sanitizeSvg(
  raw: string,
  palette: Palette,
  constraints: Constraints
): { svg: string; report: ValidationReport } {
  const issues: ValidationIssue[] = [];
  let svg = extractSvg(raw);

  // 1) Snap every color to the nearest fundamental palette color.
  svg = svg.replace(FILL_STROKE, (_m, prop: string, sep: string, quote: string, color: string) => {
    const snapped = snapToPalette(normalizeHex(color), palette);
    if (snapped.toLowerCase() !== color.toLowerCase()) {
      issues.push({ rule: "palette", message: `${color} → ${snapped}`, fixed: true });
    }
    return `${prop}${sep}${quote}${snapped}`;
  });

  const root = parse(svg, { voidTag: { tags: [] } });
  const svgEl = root.querySelector("svg");
  if (!svgEl) {
    return {
      svg,
      report: { ok: false, issues: [{ rule: "structure", message: "no <svg> element", fixed: false }] },
    };
  }

  const allowed = new Set(constraints.allowedPrimitives.map((t) => t.toLowerCase()));
  allowed.add("svg");
  allowed.add("title");
  allowed.add("desc");

  // 2) Remove disallowed elements; enforce text and complexity limits.
  let textCount = 0;
  let drawCount = 0;
  for (const el of svgEl.querySelectorAll("*")) {
    const tag = el.tagName?.toLowerCase();
    if (!tag) continue;

    if (tag === "text" || tag === "tspan") {
      textCount++;
      if (textCount > constraints.maxTextElements) {
        remove(el);
        issues.push({ rule: "text", message: `removed extra <${tag}>`, fixed: true });
      }
      continue;
    }

    if (!allowed.has(tag)) {
      remove(el);
      issues.push({ rule: "primitive", message: `removed disallowed <${tag}>`, fixed: true });
      continue;
    }

    if (tag !== "svg" && tag !== "g") {
      drawCount++;
      if (drawCount > constraints.maxElements) {
        remove(el);
        issues.push({ rule: "complexity", message: `removed element over cap`, fixed: true });
      }
    }
  }

  return {
    svg: root.toString(),
    report: { ok: issues.every((i) => i.fixed), issues },
  };
}

function normalizeHex(hex: string): string {
  const h = hex.replace("#", "");
  if (h.length === 3) {
    return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`;
  }
  return `#${h}`;
}

function remove(el: HTMLElement): void {
  el.remove();
}
