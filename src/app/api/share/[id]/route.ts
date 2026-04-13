import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ID_RE = /^[A-Za-z0-9_-]{6,32}$/;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!ID_RE.test(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const row = await prisma.sharedResult.findUnique({
    where: { shortId: id },
    select: { payload: true },
  });
  if (!row) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({ encoded: row.payload });
}
