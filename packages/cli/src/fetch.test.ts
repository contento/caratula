import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { fetchTextFromUrl } from "./fetch.js";

describe("fetchTextFromUrl", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches and returns plain text", async () => {
    const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "text/plain" }),
      text: async () => "Hello, world!",
    } as Response);

    const result = await fetchTextFromUrl("https://example.com/file.txt");
    expect(result).toBe("Hello, world!");
  });

  it("strips HTML tags and collapses whitespace", async () => {
    const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "text/html" }),
      text: async () => "<p>Hello   <strong>world</strong>!</p>",
    } as Response);

    const result = await fetchTextFromUrl("https://example.com/page.html");
    expect(result).toBe("Hello world !");
  });

  it("removes script tags and their content", async () => {
    const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "text/html" }),
      text: async () => "<p>Visible</p><script>console.log('hidden')</script><p>Also visible</p>",
    } as Response);

    const result = await fetchTextFromUrl("https://example.com/page.html");
    expect(result).toBe("Visible Also visible");
  });

  it("removes style tags and their content", async () => {
    const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "text/html" }),
      text: async () => "<p>Text</p><style>body { color: red; }</style><p>More</p>",
    } as Response);

    const result = await fetchTextFromUrl("https://example.com/page.html");
    expect(result).toBe("Text More");
  });

  it("throws on non-2xx response", async () => {
    const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      headers: new Headers(),
    } as Response);

    await expect(fetchTextFromUrl("https://example.com/notfound")).rejects.toThrow(
      /HTTP 404/
    );
  });

  it("throws on invalid URL", async () => {
    await expect(fetchTextFromUrl("not a url")).rejects.toThrow(/Invalid URL/);
  });

  it("throws on non-http(s) URL", async () => {
    await expect(fetchTextFromUrl("file:///etc/passwd")).rejects.toThrow(
      /must be http or https/
    );
  });

  it("throws on unsupported content-type", async () => {
    const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "image/png" }),
      text: async () => "",
    } as Response);

    await expect(fetchTextFromUrl("https://example.com/image.png")).rejects.toThrow(
      /Unsupported content-type/
    );
  });

  it("throws on oversized response", async () => {
    const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
    const largeText = "x".repeat(501 * 1024); // 501 KB
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "text/plain" }),
      text: async () => largeText,
    } as Response);

    await expect(fetchTextFromUrl("https://example.com/huge.txt")).rejects.toThrow(
      /Response too large/
    );
  });

  it("handles content-type with charset", async () => {
    const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "text/html; charset=utf-8" }),
      text: async () => "<p>Test</p>",
    } as Response);

    const result = await fetchTextFromUrl("https://example.com/page.html");
    expect(result).toBe("Test");
  });

  it("throws on fetch failure", async () => {
    const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    await expect(fetchTextFromUrl("https://example.com/")).rejects.toThrow(/Failed to fetch URL/);
  });
});
