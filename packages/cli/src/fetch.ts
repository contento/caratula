/**
 * Fetch readable text from a URL.
 * Supports text/plain and text/html (strips tags).
 * Rejects other content types, non-http(s), and oversized responses.
 */

const MAX_RESPONSE_SIZE = 500 * 1024; // 500 KB

/**
 * Fetch text content from a URL.
 * Handles HTML (strips tags) and plain text.
 * Throws on unsupported content-type, non-2xx, oversized, or invalid URL.
 */
export async function fetchTextFromUrl(url: string): Promise<string> {
  // Validate URL scheme
  let urlObj: URL;
  try {
    urlObj = new URL(url);
  } catch {
    throw new Error(`Invalid URL: ${url}`);
  }

  if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
    throw new Error(`URL must be http or https; got: ${urlObj.protocol}`);
  }

  // Fetch the URL
  let response: Response;
  try {
    response = await fetch(url);
  } catch (err) {
    throw new Error(`Failed to fetch URL: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Check status
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${url}`);
  }

  // Check content-type
  let contentType = "";
  const rawContentType = response.headers.get("content-type");
  if (rawContentType) {
    const parts = rawContentType.split(";");
    const mainType = parts[0];
    if (mainType) {
      contentType = mainType.trim().toLowerCase();
    }
  }
  if (!contentType.startsWith("text/plain") && !contentType.startsWith("text/html")) {
    throw new Error(
      `Unsupported content-type: ${contentType}. Only text/plain and text/html are supported.`
    );
  }

  // Read body as text
  const text = await response.text();

  // Check size
  if (text.length > MAX_RESPONSE_SIZE) {
    throw new Error(
      `Response too large: ${(text.length / 1024).toFixed(0)}KB > ${MAX_RESPONSE_SIZE / 1024}KB limit`
    );
  }

  // Strip HTML tags if needed
  if (contentType.startsWith("text/html")) {
    // Remove script and style tags first (and their content)
    let cleaned = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ");
    cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ");
    // Remove all remaining HTML tags
    cleaned = cleaned.replace(/<[^>]+>/g, " ");
    // Collapse whitespace
    cleaned = cleaned.replace(/\s+/g, " ").trim();
    return cleaned;
  }

  return text;
}
