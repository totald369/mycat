import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function displayLabel(nameKo: string | null, nameEn: string) {
  return nameKo ? `${nameKo} (${nameEn})` : nameEn;
}

export async function GET() {
  try {
    const rows = await prisma.breed.findMany({
      orderBy: { nameEn: "asc" },
      select: {
        id: true,
        apiId: true,
        nameEn: true,
        nameKo: true,
      },
    });

    const items = rows.map((r) => ({
      id: r.id,
      apiId: r.apiId,
      nameEn: r.nameEn,
      nameKo: r.nameKo,
      label: displayLabel(r.nameKo, r.nameEn),
    }));

    return NextResponse.json({ items });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "DB 오류가 발생했습니다.";
    return NextResponse.json(
      {
        items: [],
        error: `${message} (.env의 DATABASE_URL, npm run db:push / db:seed 확인)`,
      },
      { status: 503 },
    );
  }
}
