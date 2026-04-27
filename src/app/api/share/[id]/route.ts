import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUrlByShortId } from "@/lib/urlShortenerStore";

const ID_RE = /^[A-Za-z0-9_-]{6,32}$/;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!ID_RE.test(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  try {
    const row = await prisma.sharedResult.findUnique({
      where: { shortId: id },
      select: { payload: true },
    });
    if (row?.payload) {
      return NextResponse.json({ encoded: row.payload });
    }
  } catch {
    // Prisma 접근 실패 시에도 shortener store fallback을 시도한다.
  }

  const mappedUrl = await getUrlByShortId(id);
  if (mappedUrl) {
    try {
      const url = new URL(mappedUrl);
      const encoded = (url.searchParams.get("s") ?? "").trim();
      if (encoded) {
        return NextResponse.json({ encoded });
      }
    } catch {
      /* invalid URL in shortener store */
    }
  }

  return NextResponse.json({ error: "not found" }, { status: 404 });
}
