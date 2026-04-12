import { NextResponse } from "next/server";
import { loadFeedCatalogFromCatFoodCsv } from "@/lib/catFoodCsv";
import { prisma } from "@/lib/prisma";

function feedListLabel(displayLabel: string, nameKo: string | null): string {
  const ko = nameKo?.trim();
  if (!ko) return displayLabel;
  return `${ko} (${displayLabel})`;
}

async function feedsFromDb() {
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

  return rows.map((r) => ({
    id: r.id,
    apiId: r.apiId,
    displayLabel: r.displayLabel,
    label: feedListLabel(r.displayLabel, r.nameKo),
    kcalPer100g: r.kcalPer100g,
    feedKind: r.feedKind,
    servingGrams: r.servingGrams,
  }));
}

export async function GET() {
  if (process.env.DATABASE_URL) {
    try {
      const items = await feedsFromDb();
      if (items.length > 0) {
        return NextResponse.json({ items });
      }
    } catch (e) {
      console.warn("[api/feeds] DB 급여 로드 실패, cat_food.csv로 대체:", e);
    }
  }

  const fromCsv = loadFeedCatalogFromCatFoodCsv();
  if (fromCsv.length > 0) {
    return NextResponse.json({ items: fromCsv });
  }

  return NextResponse.json(
    {
      items: [],
      error:
        "급여 목록을 불러올 수 없습니다. (로컬: DATABASE_URL·db:push·db:seed:csv, 배포: prisma/cat_food.csv 포함 여부 확인)",
    },
    { status: 503 },
  );
}
