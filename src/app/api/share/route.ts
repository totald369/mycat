import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decodeShareResultPayload } from "@/lib/shareResultPayload";
import { registerShortUrl } from "@/lib/urlShortenerStore";

const ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
const ID_LENGTH = 8;
const ID_RE = /^[A-Za-z0-9_-]{6,32}$/;

function createShortId(): string {
  let out = "";
  for (let i = 0; i < ID_LENGTH; i++) {
    const idx = Math.floor(Math.random() * ID_ALPHABET.length);
    out += ID_ALPHABET[idx];
  }
  return out;
}

function isValidShortId(id: unknown): id is string {
  return typeof id === "string" && ID_RE.test(id);
}

function parseAbsoluteUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function isAllowedShareHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host === "meowdiet.com" ||
    host === "www.meowdiet.com" ||
    host === "localhost" ||
    host === "127.0.0.1"
  );
}

function toSafeErrorMessage(e: unknown): string {
  if (e instanceof Error && e.message) return e.message;
  return String(e);
}

export async function POST(req: Request) {
  const requestOrigin = new URL(req.url).origin;
  const isDev = process.env.NODE_ENV !== "production";

  try {
    const body = (await req.json()) as {
      encoded?: string;
      originalUrl?: string;
      url?: string;
      originalPath?: string;
      pathname?: string;
    };

    if (isDev) {
      console.info("[share] incoming body", {
        hasEncoded: typeof body.encoded === "string" && body.encoded.length > 0,
        originalUrl: body.originalUrl ?? null,
        url: body.url ?? null,
        pathname: body.pathname ?? body.originalPath ?? null,
      });
    }

    const encoded = (body.encoded ?? "").trim();
    const rawOriginalUrl = (body.originalUrl ?? body.url ?? "").trim();
    const rawPathname = (body.pathname ?? body.originalPath ?? "").trim();

    let originalUrl: URL | null = null;
    if (rawOriginalUrl) {
      originalUrl = parseAbsoluteUrl(rawOriginalUrl);
      if (!originalUrl) {
        console.warn("[share] invalid originalUrl", { rawOriginalUrl });
        return NextResponse.json(
          {
            success: false,
            error: "invalid originalUrl: must be an absolute URL",
          },
          { status: 400 },
        );
      }
    } else if (rawPathname) {
      try {
        originalUrl = new URL(rawPathname, requestOrigin);
      } catch {
        console.warn("[share] invalid pathname", { rawPathname });
        return NextResponse.json(
          { success: false, error: "invalid pathname" },
          { status: 400 },
        );
      }
    } else if (encoded) {
      // encoded 기반 기본 공유 URL: /result?s={encoded}
      originalUrl = new URL(`/result?s=${encodeURIComponent(encoded)}`, requestOrigin);
    }

    if (!originalUrl) {
      console.warn("[share] missing source URL and encoded payload");
      return NextResponse.json(
        {
          success: false,
          error: "missing required field: originalUrl (or url/pathname) or encoded",
        },
        { status: 400 },
      );
    }

    if (!isAllowedShareHost(originalUrl.hostname)) {
      console.warn("[share] blocked host", { hostname: originalUrl.hostname });
      return NextResponse.json(
        {
          success: false,
          error: "only meowdiet.com URLs are allowed",
        },
        { status: 400 },
      );
    }

    if (encoded) {
      const decoded = decodeShareResultPayload(encoded);
      if (!decoded.ok) {
        console.warn("[share] invalid encoded payload");
        return NextResponse.json(
          { success: false, error: "invalid encoded payload" },
          { status: 400 },
        );
      }
    }

    // 1) encoded payload가 있으면 기존 Prisma 공유 흐름을 우선 사용
    if (encoded) {
      try {
        const existing = await prisma.sharedResult.findFirst({
          where: { payload: encoded },
          select: { shortId: true },
        });
        if (existing && isValidShortId(existing.shortId)) {
          return NextResponse.json(
            {
              success: true,
              id: existing.shortId,
              shortUrl: new URL(`/r/${existing.shortId}`, requestOrigin).toString(),
            },
            { status: 200 },
          );
        }

        for (let i = 0; i < 5; i++) {
          const shortId = createShortId();
          try {
            await prisma.sharedResult.create({
              data: {
                shortId,
                payload: encoded,
              },
            });
            return NextResponse.json(
              {
                success: true,
                id: shortId,
                shortUrl: new URL(`/r/${shortId}`, requestOrigin).toString(),
              },
              { status: 201 },
            );
          } catch (e: unknown) {
            const code = (e as { code?: string })?.code;
            // P2002: unique constraint failed -> retry
            if (code !== "P2002") throw e;
          }
        }
      } catch (e) {
        // Prisma/DB 실패 시 URL shortener store로 fallback
        console.error("[share] prisma flow failed, fallback to store", {
          error: toSafeErrorMessage(e),
        });
      }
    }

    // 2) DB 실패 또는 URL-only 요청 처리
    try {
      const shortId = await registerShortUrl(originalUrl.toString());
      return NextResponse.json(
        {
          success: true,
          id: shortId,
          shortUrl: new URL(`/r/${shortId}`, requestOrigin).toString(),
        },
        { status: 201 },
      );
    } catch (e) {
      console.error("[share] fallback shortener failed", {
        error: toSafeErrorMessage(e),
      });
      return NextResponse.json(
        { success: false, error: "failed to create short link" },
        { status: 500 },
      );
    }
  } catch (e) {
    console.error("[share] malformed request body", {
      error: toSafeErrorMessage(e),
    });
    return NextResponse.json(
      { success: false, error: "invalid JSON body" },
      { status: 400 },
    );
  }
}
