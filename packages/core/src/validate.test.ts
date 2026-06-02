import { describe, it, expect } from "vitest";
import { extractSvg, sanitizeSvg } from "./validate.js";
import { BW, SEPIA } from "./palettes.js";
import { DEFAULT_CONSTRAINTS } from "./constraints.js";
import type { Constraints } from "./types.js";

const C = (over: Partial<Constraints> = {}): Constraints => ({ ...DEFAULT_CONSTRAINTS, ...over });

describe("extractSvg", () => {
  it("pulls the <svg> out of markdown fences and prose", () => {
    const raw = "Here you go:\n```svg\n<svg><circle/></svg>\n```\nEnjoy!";
    expect(extractSvg(raw)).toBe("<svg><circle/></svg>");
  });

  it("is case-insensitive on the tag", () => {
    expect(extractSvg("<SVG><LINE/></SVG>")).toBe("<SVG><LINE/></SVG>");
  });

  it("returns the trimmed input when there is no svg", () => {
    expect(extractSvg("  no image here  ")).toBe("no image here");
  });
});

describe("sanitizeSvg — palette snapping", () => {
  it("snaps an attribute-form color and keeps it well-formed", () => {
    const { svg, report } = sanitizeSvg('<svg><rect fill="#eeeeee"/></svg>', BW, C());
    expect(svg).toContain('fill="#ffffff"');
    // regression: must NOT collapse `fill="..."` into a malformed `fill:#..."`
    expect(svg).not.toMatch(/fill:#[0-9a-f]+"/i);
    expect(report.issues.some((i) => i.rule === "palette" && i.fixed)).toBe(true);
  });

  it("snaps a CSS-style color preserving the colon form", () => {
    const { svg } = sanitizeSvg('<svg><rect style="fill:#00ff88;stroke:#111111"/></svg>', SEPIA, C());
    expect(svg).toMatch(/fill:#[0-9a-f]{6}/i);
    expect(svg).toMatch(/stroke:#[0-9a-f]{6}/i);
    for (const m of svg.match(/#[0-9a-f]{6}/gi) ?? []) {
      expect(SEPIA.colors).toContain(m.toLowerCase());
    }
  });

  it("expands and snaps a 3-digit hex", () => {
    const { svg } = sanitizeSvg('<svg><rect fill="#fff"/></svg>', BW, C());
    expect(svg).toContain('fill="#ffffff"');
  });

  it("leaves an on-palette color alone and records no palette issue", () => {
    const { svg, report } = sanitizeSvg('<svg><rect fill="#000000"/></svg>', BW, C());
    expect(svg).toContain('fill="#000000"');
    expect(report.issues.some((i) => i.rule === "palette")).toBe(false);
  });

  it("snaps stroke as well as fill", () => {
    const { svg } = sanitizeSvg('<svg><line stroke="#00ff88"/></svg>', SEPIA, C());
    const colors = svg.match(/#[0-9a-f]{6}/gi) ?? [];
    expect(colors.length).toBeGreaterThan(0);
    for (const c of colors) expect(SEPIA.colors).toContain(c.toLowerCase());
  });
});

describe("sanitizeSvg — structure & primitives", () => {
  it("reports an error when there is no <svg> root", () => {
    const { report } = sanitizeSvg("<div>not an image</div>", BW, C());
    expect(report.ok).toBe(false);
    expect(report.issues.some((i) => i.rule === "structure" && !i.fixed)).toBe(true);
  });

  it("removes disallowed elements", () => {
    const raw = '<svg><script>alert(1)</script><image href="x"/><circle/></svg>';
    // Use restricted constraints to test that disallowed primitives are removed
    const restricted = C({ allowedPrimitives: ["path", "line", "polyline", "polygon", "circle", "ellipse", "rect", "g"] });
    const { svg, report } = sanitizeSvg(raw, BW, restricted);
    expect(svg).not.toContain("<script>");
    expect(svg).not.toContain("<image");
    expect(svg).toContain("<circle");
    expect(report.issues.filter((i) => i.rule === "primitive")).toHaveLength(2);
  });

  it("keeps allowed structural elements (g, title, desc)", () => {
    const raw = "<svg><title>t</title><desc>d</desc><g><line/></g></svg>";
    const { svg } = sanitizeSvg(raw, BW, C());
    expect(svg).toContain("<title>");
    expect(svg).toContain("<desc>");
    expect(svg).toContain("<g>");
    expect(svg).toContain("<line");
  });
});

describe("sanitizeSvg — text policy", () => {
  it("removes all text when maxTextElements is 0", () => {
    const { svg, report } = sanitizeSvg("<svg><text>hi</text><circle/></svg>", BW, C({ maxTextElements: 0 }));
    expect(svg).not.toContain("<text");
    expect(report.issues.some((i) => i.rule === "text")).toBe(true);
  });

  it("keeps up to the limit and drops the rest", () => {
    const raw = "<svg><text>a</text><text>b</text><text>c</text></svg>";
    const { svg } = sanitizeSvg(raw, BW, C({ maxTextElements: 1 }));
    expect(svg.match(/<text/g) ?? []).toHaveLength(1);
  });
});

describe("sanitizeSvg — complexity cap", () => {
  it("removes drawable elements beyond maxElements", () => {
    const circles = Array.from({ length: 6 }, () => "<circle/>").join("");
    const { svg, report } = sanitizeSvg(`<svg>${circles}</svg>`, BW, C({ maxElements: 3 }));
    expect(svg.match(/<circle/g) ?? []).toHaveLength(3);
    expect(report.issues.filter((i) => i.rule === "complexity")).toHaveLength(3);
  });

  it("does not count <g> wrappers against the cap", () => {
    const { svg } = sanitizeSvg("<svg><g><g><circle/></g></g></svg>", BW, C({ maxElements: 1 }));
    expect(svg).toContain("<circle");
  });
});

describe("sanitizeSvg — report semantics", () => {
  it("is ok when every issue was fixed", () => {
    const { report } = sanitizeSvg('<svg><rect fill="#eeeeee"/></svg>', BW, C());
    expect(report.ok).toBe(true);
    expect(report.issues.every((i) => i.fixed)).toBe(true);
  });

  it("works on fenced LLM output end-to-end", () => {
    const raw = "```svg\n<svg><rect fill=\"#00ff88\"/></svg>\n```";
    const { svg } = sanitizeSvg(raw, SEPIA, C());
    expect(svg).toContain("<svg");
    expect(svg).not.toContain("```");
    for (const c of svg.match(/#[0-9a-f]{6}/gi) ?? []) {
      expect(SEPIA.colors).toContain(c.toLowerCase());
    }
  });
});
