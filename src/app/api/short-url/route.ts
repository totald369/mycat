import { NextResponse } from "next/server";
import { generateShortUrl } from "@/lib/urlShortener";

export const runtime = "nodejs";

function originFromRequest(req: Request): string | undefined {
  const u = req.headers.get("x-forwarded-host");
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  if (u) return `${proto.split(",")[0]!.trim()}://${u.split(",")[0]!.trim()}`;
  const host = req.headers.get("host");
  if (!host) return undefined;
  const isLocal = host.startsWith("localhost") || host.startsWith("127.");
  return `${isLocal ? "http" : "https"}://${host}`;
}

/**
 * POST /api/short-url
 * Body: `{ "url": "https://..." }`
 * Response: `{ "id", "shortUrl" }`
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { url?: string };
    const url = (body.url ?? "").trim();
    if (!url) {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }

    const origin = originFromRequest(req);
    const shortUrl = await generateShortUrl(url, origin);
    const id = new URL(shortUrl).pathname.replace(/^\/r\//, "");

    return NextResponse.json({ id, shortUrl }, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "bad request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
