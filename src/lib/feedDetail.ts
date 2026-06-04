import {
  loadFeedDetailItemsFromCatFoodCsv,
  type FeedDetailItem,
} from "@/lib/catFoodCsv";
import { safeNumber, safeString } from "@/lib/feedSafeValues";
import {
  assignUniqueFeedSlugs,
  feedDetailPath,
  isLegacyCsvFeedId,
} from "@/lib/feedSlug";
import { prisma } from "@/lib/prisma";

export type FeedDetailItemWithSlug = FeedDetailItem;

let cachedFeeds: FeedDetailItemWithSlug[] | null = null;
let slugIndex: Map<string, FeedDetailItemWithSlug> | null = null;
let legacyIdIndex: Map<string, FeedDetailItemWithSlug> | null = null;

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
}): Omit<FeedDetailItem, "slug"> | null {
  if (row.kcalPer100g == null || !Number.isFinite(row.kcalPer100g)) {
    return null;
  }

  const feedKind = safeString(row.feedKind).trim() || "기타";
  const rawType =
    feedKind === "습식" ? "wet" : feedKind === "건식" ? "dry" : feedKind;
  const kcal = safeNumber(row.kcalPer100g);
  if (kcal == null) return null;

  return {
    id: row.id,
    apiId: row.apiId,
    brand: safeString(row.brand).trim() || "—",
    name: safeString(row.name).trim() || "이름 없음",
    displayLabel: row.displayLabel,
    label: row.displayLabel,
    kcalPer100g: kcal,
    feedKind,
    servingGrams: row.servingGrams,
    category: row.category,
    feedCondition: row.feedCondition,
    rawType,
    lifeStage: row.lifeStage,
  };
}

function buildIndexes(feeds: FeedDetailItemWithSlug[]) {
  slugIndex = new Map(feeds.map((f) => [f.slug, f]));
  legacyIdIndex = new Map(feeds.map((f) => [f.id, f]));
}

/** CSV 로드 + slug 부여 (빌드·런타임 공용 캐시) */
export function getAllFeedDetails(): FeedDetailItemWithSlug[] {
  if (cachedFeeds) return cachedFeeds;

  const raw = loadFeedDetailItemsFromCatFoodCsv();
  cachedFeeds = assignUniqueFeedSlugs(raw);
  buildIndexes(cachedFeeds);
  return cachedFeeds;
}

export function getFeedDetailFromCsvById(id: string): FeedDetailItemWithSlug | null {
  getAllFeedDetails();
  return legacyIdIndex?.get(id) ?? null;
}

export function getFeedBySlug(slug: string): FeedDetailItemWithSlug | null {
  getAllFeedDetails();
  return slugIndex?.get(slug) ?? null;
}

export type FeedRouteResolution = {
  feed: FeedDetailItemWithSlug;
  canonicalSlug: string;
  /** csv-* 등 레거시 ID로 접근한 경우 */
  isLegacyRedirect: boolean;
};

export function resolveFeedRouteParam(
  param: string,
): FeedRouteResolution | null {
  const fromCsv = getAllFeedDetails();
  if (fromCsv.length > 0) {
    if (isLegacyCsvFeedId(param)) {
      const feed = legacyIdIndex?.get(param);
      if (!feed) return null;
      return {
        feed,
        canonicalSlug: feed.slug,
        isLegacyRedirect: true,
      };
    }
    const bySlug = slugIndex?.get(param);
    if (bySlug) {
      return {
        feed: bySlug,
        canonicalSlug: bySlug.slug,
        isLegacyRedirect: false,
      };
    }
    return null;
  }

  return null;
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
    const mapped = mapDbRowToFeedDetail(row);
    if (!mapped) return null;
    const [withSlug] = assignUniqueFeedSlugs([mapped]);
    return withSlug;
  } catch {
    return null;
  }
}

/** @deprecated slug 기반 listFeedDetailSlugs 사용 */
export function listFeedDetailIds(): string[] {
  return getAllFeedDetails().map((item) => item.id);
}

export function listFeedDetailSlugs(): string[] {
  return getAllFeedDetails().map((item) => item.slug);
}

export function getFeedDetailPath(feed: Pick<FeedDetailItemWithSlug, "slug">): string {
  return feedDetailPath(feed.slug);
}

const RELATED_LIMIT = 6;

export type RelatedFeedLink = {
  href: string;
  label: string;
  kcalPer100g: number;
};

export function getRelatedFeedsByBrand(
  feed: FeedDetailItemWithSlug,
  limit = RELATED_LIMIT,
): RelatedFeedLink[] {
  return getAllFeedDetails()
    .filter((f) => f.slug !== feed.slug && f.brand === feed.brand)
    .slice(0, limit)
    .map((f) => ({
      href: getFeedDetailPath(f),
      label: `${f.brand} ${f.name}`,
      kcalPer100g: f.kcalPer100g,
    }));
}

export function getRelatedFeedsByLifeStage(
  feed: FeedDetailItemWithSlug,
  limit = RELATED_LIMIT,
): RelatedFeedLink[] {
  if (!feed.lifeStage) return [];
  return getAllFeedDetails()
    .filter(
      (f) =>
        f.slug !== feed.slug &&
        f.lifeStage === feed.lifeStage &&
        f.brand !== feed.brand,
    )
    .slice(0, limit)
    .map((f) => ({
      href: getFeedDetailPath(f),
      label: `${f.brand} ${f.name}`,
      kcalPer100g: f.kcalPer100g,
    }));
}

export function getRelatedFeedsBySimilarKcal(
  feed: FeedDetailItemWithSlug,
  limit = RELATED_LIMIT,
): RelatedFeedLink[] {
  const baseKcal = safeNumber(feed.kcalPer100g);
  if (baseKcal == null) return [];

  const tolerance = Math.max(15, baseKcal * 0.12);
  return getAllFeedDetails()
    .filter((f) => {
      if (f.slug === feed.slug) return false;
      const kcal = safeNumber(f.kcalPer100g);
      if (kcal == null) return false;
      return Math.abs(kcal - baseKcal) <= tolerance;
    })
    .sort((a, b) => {
      const aKcal = safeNumber(a.kcalPer100g) ?? 0;
      const bKcal = safeNumber(b.kcalPer100g) ?? 0;
      return Math.abs(aKcal - baseKcal) - Math.abs(bKcal - baseKcal);
    })
    .slice(0, limit)
    .map((f) => ({
      href: getFeedDetailPath(f),
      label: `${safeString(f.brand).trim() || "—"} ${safeString(f.name).trim() || "이름 없음"} (${safeNumber(f.kcalPer100g) ?? "—"} kcal/100g)`,
      kcalPer100g: safeNumber(f.kcalPer100g) ?? 0,
    }));
}
