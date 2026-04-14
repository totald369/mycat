import { registerShortUrl } from "@/lib/urlShortenerStore";

const HTTP_URL_RE = /^https?:\/\//i;

function defaultBaseOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "")}`;
  return "http://localhost:3000";
}

/**
 * Creates a random 6-character id, maps it to `originalUrl`, and returns
 * the public short link: `{baseOrigin}/r/{id}`.
 *
 * Call from the server only (uses file storage and env).
 */
export async function generateShortUrl(
  originalUrl: string,
  baseOrigin?: string,
): Promise<string> {
  const trimmed = originalUrl.trim();
  if (!HTTP_URL_RE.test(trimmed)) {
    throw new Error("originalUrl must be an absolute http(s) URL");
  }
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error("invalid URL");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("only http and https URLs are allowed");
  }

  const id = await registerShortUrl(parsed.toString());
  const origin = (baseOrigin ?? defaultBaseOrigin()).replace(/\/$/, "");
  return new URL(`/r/${encodeURIComponent(id)}`, `${origin}/`).toString();
}
