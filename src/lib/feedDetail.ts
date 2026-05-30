import {
  loadFeedDetailItemsFromCatFoodCsv,
  type FeedDetailItem,
} from "@/lib/catFoodCsv";
import { prisma } from "@/lib/prisma";

function mapDbRowToFeedDetail(row: {
  id: string;
  apiId: string;
  brand: string | null;
  name: string;
  displayLabel: string;
  feedKind: string;
  lifeStage: string | null;
  kcalPer100g: number | null;
  servingGrams: number | null;
  category: string | null;
  feedCondition: string | null;
}): FeedDetailItem | null {
  if (row.kcalPer100g == null || !Number.isFinite(row.kcalPer100g)) {
    return null;
  }

  const feedKind = row.feedKind.trim();
  const rawType =
    feedKind === "습식" ? "wet" : feedKind === "건식" ? "dry" : feedKind;

  return {
    id: row.id,
    apiId: row.apiId,
    brand: row.brand?.trim() || "—",
    name: row.name.trim(),
    displayLabel: row.displayLabel,
    label: row.displayLabel,
    kcalPer100g: row.kcalPer100g,
    feedKind,
    servingGrams: row.servingGrams,
    category: row.category,
    feedCondition: row.feedCondition,
    rawType,
    lifeStage: row.lifeStage,
  };
}

export function getFeedDetailFromCsvById(id: string): FeedDetailItem | null {
  return (
    loadFeedDetailItemsFromCatFoodCsv().find((item) => item.id === id) ?? null
  );
}

export async function getFeedById(id: string): Promise<FeedDetailItem | null> {
  const fromCsv = getFeedDetailFromCsvById(id);
  if (fromCsv) return fromCsv;

  if (!process.env.DATABASE_URL) return null;

  try {
    const row = await prisma.feedProduct.findUnique({
      where: { id },
      select: {
        id: true,
        apiId: true,
        brand: true,
        name: true,
        displayLabel: true,
        feedKind: true,
        lifeStage: true,
        kcalPer100g: true,
        servingGrams: true,
        category: true,
        feedCondition: true,
      },
    });
    if (!row) return null;
    return mapDbRowToFeedDetail(row);
  } catch {
    return null;
  }
}

export function listFeedDetailIds(): string[] {
  return loadFeedDetailItemsFromCatFoodCsv().map((item) => item.id);
}
