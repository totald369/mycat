import { getAllFeedDetails } from "@/lib/feedDetail";
import { prisma } from "@/lib/prisma";
import type { CatalogItem } from "@/components/wireframe/CatalogSearchModal";

function feedListLabel(displayLabel: string, nameKo: string | null): string {
  const ko = nameKo?.trim();
  if (!ko) return displayLabel;
  return `${ko} (${displayLabel})`;
}

async function feedsFromDb(): Promise<CatalogItem[]> {
  const rows = await prisma.feedProduct.findMany({
    where: { kcalPer100g: { not: null } },
    orderBy: { displayLabel: "asc" },
    select: {
      id: true,
      apiId: true,
      brand: true,
      name: true,
      displayLabel: true,
      nameKo: true,
      kcalPer100g: true,
      feedKind: true,
      servingGrams: true,
      category: true,
      feedCondition: true,
      lifeStage: true,
    },
  });

  return rows.map((r) => {
    const feedKind = r.feedKind.trim();
    const rawType =
      feedKind === "습식" ? "wet" : feedKind === "건식" ? "dry" : feedKind;

    return {
      id: r.id,
      apiId: r.apiId,
      brand: r.brand,
      name: r.name,
      displayLabel: r.displayLabel,
      nameKo: r.nameKo,
      label: feedListLabel(r.displayLabel, r.nameKo),
      kcalPer100g: r.kcalPer100g,
      feedKind: r.feedKind,
      servingGrams: r.servingGrams,
      category: r.category,
      feedCondition: r.feedCondition,
      lifeStage: r.lifeStage,
      rawType,
    };
  });
}

/** `/api/feeds`와 동일한 카탈로그 — 서버 컴포넌트·API 공용 */
export async function getFeedCatalogItems(): Promise<CatalogItem[]> {
  const fromCsv = getAllFeedDetails();
  if (fromCsv.length > 0) {
    return fromCsv;
  }

  if (process.env.DATABASE_URL) {
    try {
      const items = await feedsFromDb();
      if (items.length > 0) {
        return items;
      }
    } catch (e) {
      console.warn("[feedCatalog] DB 급여 로드 실패:", e);
    }
  }

  return [];
}
