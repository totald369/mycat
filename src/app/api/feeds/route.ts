import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function feedListLabel(displayLabel: string, nameKo: string | null): string {
  const ko = nameKo?.trim();
  if (!ko) return displayLabel;
  return `${ko} (${displayLabel})`;
}

export async function GET() {
  try {
    // OPFF 시드는 kcalPer100g 없음. cat_food.csv(db:seed:csv)로 넣은 행만 검색·계산에 사용
    const rows = await prisma.feedProduct.findMany({
      where: { kcalPer100g: { not: null } },
      orderBy: { displayLabel: "asc" },
      select: {
        id: true,
        apiId: true,
        displayLabel: true,
        nameKo: true,
        kcalPer100g: true,
        feedKind: true,
        servingGrams: true,
      },
    });

    const items = rows.map((r) => ({
      id: r.id,
      apiId: r.apiId,
      displayLabel: r.displayLabel,
      label: feedListLabel(r.displayLabel, r.nameKo),
      kcalPer100g: r.kcalPer100g,
      feedKind: r.feedKind,
      servingGrams: r.servingGrams,
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
