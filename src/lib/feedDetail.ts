import {
  loadFeedDetailItemsFromCatFoodCsv,
  type FeedDetailItem,
} from "@/lib/catFoodCsv";
import { safeLower, safeNumber, safeString } from "@/lib/feedSafeValues";
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

type FeedDetailIndexes = {
  all: FeedDetailItemWithSlug[];
  byBrand: Map<string, FeedDetailItemWithSlug[]>;
  byLifeStage: Map<string, FeedDetailItemWithSlug[]>;
  kcalSorted: FeedDetailItemWithSlug[];
};

let feedIndexes: FeedDetailIndexes | null = null;

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
  servingGuideGrams: number | null;
  servingGuideWeightKg: number | null;
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
    servingGuideGrams: row.servingGuideGrams,
    servingGuideWeightKg: row.servingGuideWeightKg,
    category: row.category,
    feedCondition: row.feedCondition,
    rawType,
    lifeStage: row.lifeStage,
  };
}

function buildIndexes(feeds: FeedDetailItemWithSlug[]) {
  slugIndex = new Map(feeds.map((f) => [f.slug, f]));
  legacyIdIndex = new Map(feeds.map((f) => [f.id, f]));

  const byBrand = new Map<string, FeedDetailItemWithSlug[]>();
  const byLifeStage = new Map<string, FeedDetailItemWithSlug[]>();

  for (const feed of feeds) {
    const brandList = byBrand.get(feed.brand);
    if (brandList) brandList.push(feed);
    else byBrand.set(feed.brand, [feed]);

    if (feed.lifeStage) {
      const lifeStageList = byLifeStage.get(feed.lifeStage);
      if (lifeStageList) lifeStageList.push(feed);
      else byLifeStage.set(feed.lifeStage, [feed]);
    }
  }

  const kcalSorted = [...feeds].sort((a, b) => {
    const aKcal = safeNumber(a.kcalPer100g) ?? 0;
    const bKcal = safeNumber(b.kcalPer100g) ?? 0;
    return aKcal - bKcal;
  });

  feedIndexes = { all: feeds, byBrand, byLifeStage, kcalSorted };
}

function getFeedIndexes(): FeedDetailIndexes {
  getAllFeedDetails();
  return feedIndexes!;
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
        servingGuideGrams: true,
        servingGuideWeightKg: true,
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
const RELATED_LINK_MAX = 8;

export type RelatedFeedLink = {
  href: string;
  label: string;
  kcalPer100g: number;
  reasonLabel?: string;
};

function toBasicRelatedLink(feed: FeedDetailItemWithSlug): RelatedFeedLink {
  return {
    href: getFeedDetailPath(feed),
    label: `${feed.brand} ${feed.name}`,
    kcalPer100g: feed.kcalPer100g,
  };
}

function toKcalRelatedLink(feed: FeedDetailItemWithSlug): RelatedFeedLink {
  return {
    href: getFeedDetailPath(feed),
    label: `${safeString(feed.brand).trim() || "—"} ${safeString(feed.name).trim() || "이름 없음"} (${safeNumber(feed.kcalPer100g) ?? "—"} kcal/100g)`,
    kcalPer100g: safeNumber(feed.kcalPer100g) ?? 0,
  };
}

function purposeKeywordsFor(feed: FeedDetailItemWithSlug): string[] {
  const cond = safeLower(feed.feedCondition);
  const ls = safeLower(feed.lifeStage);
  const keywords: string[] = [];

  if (cond === "weight" || cond === "diet" || ls === "weight_control")
    keywords.push("체중", "라이트", "다이어트", "weight");
  if (cond === "urinary") keywords.push("유리너리", "비뇨", "urinary");
  if (cond === "hairball") keywords.push("헤어볼", "hairball");
  if (cond === "kidney" || cond === "renal")
    keywords.push("신장", "kidney", "renal");
  if (ls.includes("indoor") || cond === "indoor")
    keywords.push("인도어", "indoor", "실내");
  if (ls.includes("kitten")) keywords.push("키튼", "kitten");
  if (ls.includes("senior")) keywords.push("7세", "11세", "노령", "senior");

  return keywords;
}

function feedMatchesPurpose(
  candidate: FeedDetailItemWithSlug,
  feed: FeedDetailItemWithSlug,
  purposeKeywords: string[],
): boolean {
  if (candidate.slug === feed.slug || candidate.brand === feed.brand) return false;

  const cond = safeLower(feed.feedCondition);
  const ls = safeLower(feed.lifeStage);
  const fCond = safeLower(candidate.feedCondition);
  const fLs = safeLower(candidate.lifeStage);
  const fName = safeLower(candidate.name);

  if (cond && cond !== "none" && fCond === cond) return true;
  if (ls && fLs === ls && ls !== "all_life_stage" && ls !== "all") return true;
  if (purposeKeywords.length > 0) {
    const hay = `${fName} ${fCond} ${fLs}`;
    return purposeKeywords.some((kw) => hay.includes(kw));
  }
  return false;
}

export function getRelatedFeedsByBrand(
  feed: FeedDetailItemWithSlug,
  limit = RELATED_LIMIT,
): RelatedFeedLink[] {
  const { byBrand } = getFeedIndexes();
  const result: RelatedFeedLink[] = [];

  for (const candidate of byBrand.get(feed.brand) ?? []) {
    if (candidate.slug === feed.slug) continue;
    result.push(toBasicRelatedLink(candidate));
    if (result.length >= limit) break;
  }

  return result;
}

export function getRelatedFeedsByLifeStage(
  feed: FeedDetailItemWithSlug,
  limit = RELATED_LIMIT,
): RelatedFeedLink[] {
  if (!feed.lifeStage) return [];

  const { byLifeStage } = getFeedIndexes();
  const result: RelatedFeedLink[] = [];

  for (const candidate of byLifeStage.get(feed.lifeStage) ?? []) {
    if (candidate.slug === feed.slug || candidate.brand === feed.brand) continue;
    result.push(toBasicRelatedLink(candidate));
    if (result.length >= limit) break;
  }

  return result;
}

/** 같은 목적(기능·condition·lifeStage) 사료 */
export function getRelatedFeedsByPurpose(
  feed: FeedDetailItemWithSlug,
  limit = RELATED_LIMIT,
): RelatedFeedLink[] {
  const { all } = getFeedIndexes();
  const purposeKeywords = purposeKeywordsFor(feed);
  const result: RelatedFeedLink[] = [];

  for (const candidate of all) {
    if (!feedMatchesPurpose(candidate, feed, purposeKeywords)) continue;
    result.push(toBasicRelatedLink(candidate));
    if (result.length >= limit) break;
  }

  return result;
}

export function getRelatedFeedsBySimilarKcal(
  feed: FeedDetailItemWithSlug,
  limit = RELATED_LIMIT,
): RelatedFeedLink[] {
  const baseKcal = safeNumber(feed.kcalPer100g);
  if (baseKcal == null) return [];

  const tolerance = Math.max(15, baseKcal * 0.12);
  const { all, kcalSorted } = getFeedIndexes();
  const csvOrder = new Map(all.map((f, index) => [f.slug, index]));
  const minKcal = baseKcal - tolerance;
  const maxKcal = baseKcal + tolerance;
  const matches: FeedDetailItemWithSlug[] = [];

  for (const candidate of kcalSorted) {
    const kcal = safeNumber(candidate.kcalPer100g);
    if (kcal == null) continue;
    if (kcal < minKcal) continue;
    if (kcal > maxKcal) break;
    if (candidate.slug === feed.slug) continue;
    matches.push(candidate);
  }

  return matches
    .sort((a, b) => {
      const aKcal = safeNumber(a.kcalPer100g) ?? 0;
      const bKcal = safeNumber(b.kcalPer100g) ?? 0;
      const distDiff = Math.abs(aKcal - baseKcal) - Math.abs(bKcal - baseKcal);
      if (distDiff !== 0) return distDiff;
      return (csvOrder.get(a.slug) ?? 0) - (csvOrder.get(b.slug) ?? 0);
    })
    .slice(0, limit)
    .map(toKcalRelatedLink);
}


/** 브랜드·목적·연령·칼로리 기준 내부 링크 4~8개 (중복 제거) */
export function buildFeedRelatedInternalLinks(
  feed: FeedDetailItemWithSlug,
  sections: {
    byPurpose?: RelatedFeedLink[];
    byBrand?: RelatedFeedLink[];
    byLifeStage?: RelatedFeedLink[];
    byKcal?: RelatedFeedLink[];
  },
): RelatedFeedLink[] {
  const seen = new Set<string>();
  const merged: RelatedFeedLink[] = [];

  const add = (links: RelatedFeedLink[] | undefined, reasonLabel: string) => {
    for (const link of links ?? []) {
      if (seen.has(link.href)) continue;
      seen.add(link.href);
      merged.push({ ...link, reasonLabel });
      if (merged.length >= RELATED_LINK_MAX) return;
    }
  };

  add(sections.byPurpose, "같은 목적");
  add(sections.byBrand, "같은 브랜드");
  add(sections.byLifeStage, "같은 연령대");
  add(sections.byKcal, "비슷한 칼로리");

  if (merged.length >= RELATED_LINK_MAX) return merged.slice(0, RELATED_LINK_MAX);
  return merged;
}
