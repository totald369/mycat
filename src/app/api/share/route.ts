import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decodeShareResultPayload } from "@/lib/shareResultPayload";

const ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
const ID_LENGTH = 8;

function createShortId(): string {
  let out = "";
  for (let i = 0; i < ID_LENGTH; i++) {
    const idx = Math.floor(Math.random() * ID_ALPHABET.length);
    out += ID_ALPHABET[idx];
  }
  return out;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { encoded?: string };
    const encoded = (body.encoded ?? "").trim();
    if (!encoded) {
      return NextResponse.json({ error: "encoded payload is required" }, { status: 400 });
    }

    const decoded = decodeShareResultPayload(encoded);
    if (!decoded.ok) {
      return NextResponse.json({ error: "invalid payload" }, { status: 400 });
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
        return NextResponse.json({ id: shortId }, { status: 201 });
      } catch (e: unknown) {
        // P2002: unique constraint failed -> retry
        const code = (e as { code?: string })?.code;
        if (code !== "P2002") throw e;
      }
    }

    return NextResponse.json({ error: "failed to create share id" }, { status: 500 });
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
}
