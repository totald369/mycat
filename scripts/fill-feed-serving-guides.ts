/**
 * 건식 사료 브랜드 급여 가이드 → cat_food.csv `guide_daily_g` / `guide_weight_kg` 일괄 채우기
 *
 * Usage:
 *   npm run feed-guides:fill              # 스크래핑 + CSV 반영
 *   npm run feed-guides:fill -- --dry-run # 미리보기만
 *   npm run feed-guides:fill -- --brand=로얄캐닌
 *   npm run feed-guides:fill -- --scrape-only
 *   npm run feed-guides:fill -- --apply-only
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  loadCatFoodCsv,
  resolveCsvPath,
  writeCatFoodCsv,
  type CsvFeedRow,
} from "./lib/feedServingGuideCsv";
import {
  matchHillsCsvRow,
  propagateHillsLegacyGuides,
  resolveRcCsvRow,
} from "./lib/feedServingGuideMatch";
import {
  RC_RETAIL_SLUGS,
} from "./lib/feedServingGuideRoyalCanin";
import {
  defaultGuideWeightKg,
  parseHillsFeedingHtml,
  parseRoyalCaninFeedingHtml,
  pickGuideGrams,
} from "./lib/feedServingGuideParse";

const MIN_DAILY_GRAMS = 15;
const MAX_DAILY_GRAMS = 250;
const CACHE_PATH = join(process.cwd(), "scripts", "feed-serving-guides-cache.json");
const HILLS_SCRAPED_PATH = join(process.cwd(), "scripts", "hills-scraped.json");
const HILLS_EXTRA_DRY_URLS = [
  "https://www.hillspet.co.kr/cat-food/prescription-diet-cd-multicare-metabolic-urinary-care-dry",
];

const RC_VET_SLUGS: { id: string; slug: string }[] = [
  { id: "73", slug: "renal-special-3949" },
  { id: "74", slug: "renal-select-4160" },
  { id: "75", slug: "early-renal-1242" },
  { id: "76", slug: "renal-1246" },
  { id: "77", slug: "urinary-so-3901" },
  { id: "78", slug: "urinary-so-moderate-calorie-3954" },
  { id: "79", slug: "urinary-so-1254" },
  { id: "80", slug: "gastrointestinal-3905" },
  { id: "81", slug: "gastrointestinal-moderate-calorie-4008" },
  { id: "82", slug: "gastrointestinal-fibre-response-4007" },
  { id: "83", slug: "gastrointestinal-4039" },
  { id: "84", slug: "hypoallergenic-3902" },
  { id: "85", slug: "anallergenic-1950" },
  { id: "86", slug: "satiety-weight-management-3943" },
  { id: "87", slug: "neutered-satiety-balance-2721" },
  { id: "88", slug: "diabetic-3906" },
  { id: "89", slug: "hepatic-4012" },
];

export type GuideCacheEntry = {
  feedId: string;
  brand: string;
  name: string;
  guideDailyG: number;
  guideWeightKg: number;
  source: string;
  sourceUrl?: string;
  scrapedTitle?: string;
};

type GuideCacheFile = {
  updatedAt: string;
  entries: GuideCacheEntry[];
  unmatched: { brand: string; title: string; url?: string; reason: string }[];
};

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
  Accept: "text/html,application/xhtml+xml",
};

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchHtmlWithRetry(
  url: string,
  headers: Record<string, string>,
  retries = 4,
): Promise<string | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers });
      if (res.status === 403 || res.status === 429) {
        await sleep(1200 * (i + 1));
        continue;
      }
      if (!res.ok) return null;
      const html = await res.text();
      if (html.length >= 5000) return html;
      await sleep(900 * (i + 1));
    } catch {
      await sleep(900 * (i + 1));
    }
  }
  return null;
}

function parseArgs(argv: string[]) {
  return {
    dryRun: argv.includes("--dry-run"),
    scrapeOnly: argv.includes("--scrape-only"),
    applyOnly: argv.includes("--apply-only"),
    force: argv.includes("--force"),
    brand: argv.find((a) => a.startsWith("--brand="))?.split("=")[1],
    delayMs: Number(argv.find((a) => a.startsWith("--delay="))?.split("=")[1] ?? 280),
  };
}

/** @deprecated — RC_RETAIL_SLUGS 사용 */
async function fetchRoyalCaninSlugs(): Promise<string[]> {
  const slugs = new Set<string>(RC_RETAIL_SLUGS);
  for (const item of RC_VET_SLUGS) slugs.add(item.slug);
  return [...slugs].sort();
}

async function fetchRoyalCaninProduct(
  slug: string,
  vet: boolean,
): Promise<{
  title: string;
  technology: string;
  feedingHtml: string;
  url: string;
} | null> {
  const locales = ["kr", "uk", "us"] as const;
  const base = vet ? "vet-products" : "retail-products";
  const slugVariants = [slug];
  if (slug.includes("&")) slugVariants.push(slug.replace(/&/g, "%26"));

  const found: {
    title: string;
    technology: string;
    feedingHtml: string;
    url: string;
  }[] = [];

  for (const locale of locales) {
    for (const slugTry of slugVariants) {
      const url = `https://www.royalcanin.com/${locale}/cats/products/${base}/${slugTry}`;
      try {
        const html = await fetchHtmlWithRetry(url, {
          ...FETCH_HEADERS,
          Referer: `https://www.royalcanin.com/${locale}/`,
          "Accept-Language":
            locale === "kr" ? "ko-KR,ko;q=0.9" : "en-GB,en;q=0.9",
        });
        if (!html) continue;
        const m = html.match(
          /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/,
        );
        if (!m || html.length < 5000) continue;
        const r = JSON.parse(m[1]).props?.pageProps?.productData?.response;
        if (!r || r.technology !== "dry") continue;

        const feedingHtml = r.original_product?.feeding_guideline_html ?? "";
        if (feedingHtml.trim()) {
          found.push({
            title: r.title,
            technology: r.technology,
            feedingHtml,
            url,
          });
        }
      } catch {
        /* try next locale / slug variant */
      }
    }
  }

  if (!found.length) return null;

  let best = found[0];
  let bestScore = scoreFeedingHtml(best.feedingHtml);
  for (const item of found.slice(1)) {
    const score = scoreFeedingHtml(item.feedingHtml);
    if (score > bestScore) {
      best = item;
      bestScore = score;
    }
  }
  return best;
}

function scoreFeedingHtml(feedingHtml: string): number {
  const parsed = parseRoyalCaninFeedingHtml(feedingHtml);
  if (!parsed?.rows.length) return 0;
  const maxGrams = Math.max(...parsed.rows.map((r) => r.dailyGrams));
  if (maxGrams < 15) return parsed.rows.length;
  return parsed.rows.length + 100;
}

async function scrapeRoyalCanin(
  csvRows: CsvFeedRow[],
  delayMs: number,
): Promise<GuideCacheFile> {
  const entries: GuideCacheEntry[] = [];
  const unmatched: GuideCacheFile["unmatched"] = [];
  const slugs = await fetchRoyalCaninSlugs();
  console.log(`[RC] ${slugs.length}개 슬러그 스크래핑…`);

  for (const slug of slugs) {
    const vet = RC_VET_SLUGS.some((v) => v.slug === slug);
    const product = await fetchRoyalCaninProduct(slug, vet);
    await sleep(delayMs);

    if (!product) {
      unmatched.push({ brand: "로얄캐닌", title: slug, reason: "페이지 없음/건식 아님" });
      continue;
    }

    const parsed = parseRoyalCaninFeedingHtml(product.feedingHtml ?? "");
    if (!parsed) {
      unmatched.push({
        brand: "로얄캐닌",
        title: product.title,
        url: product.url,
        reason: "급여표 파싱 실패",
      });
      continue;
    }

    const vetId = vet ? RC_VET_SLUGS.find((v) => v.slug === slug)?.id : undefined;
    const csvRow = resolveRcCsvRow(csvRows, {
      slug,
      title: product.title,
      vetFeedId: vetId,
      technology: product.technology,
    });

    if (!csvRow) {
      unmatched.push({
        brand: "로얄캐닌",
        title: product.title,
        url: product.url,
        reason: "CSV 매칭 실패",
      });
      continue;
    }

    const targetKg = defaultGuideWeightKg(csvRow.lifeStage);
    const picked = pickGuideGrams(parsed, targetKg);
    if (!picked) {
      unmatched.push({
        brand: "로얄캐닌",
        title: product.title,
        url: product.url,
        reason: "기준 체중 행 없음",
      });
      continue;
    }

    if (
      picked.dailyGrams < MIN_DAILY_GRAMS ||
      picked.dailyGrams > MAX_DAILY_GRAMS
    ) {
      unmatched.push({
        brand: "로얄캐닌",
        title: product.title,
        url: product.url,
        reason: `비현실적 급여량 ${picked.dailyGrams}g`,
      });
      continue;
    }

    entries.push({
      feedId: csvRow.id,
      brand: csvRow.brand,
      name: csvRow.name,
      guideDailyG: picked.dailyGrams,
      guideWeightKg: targetKg,
      source: "royalcanin.com",
      sourceUrl: product.url,
      scrapedTitle: product.title,
    });
    console.log(
      `  ✓ ${csvRow.name}: ${targetKg}kg → ${picked.dailyGrams}g/일 (${product.title})`,
    );
  }

  return {
    updatedAt: new Date().toISOString(),
    entries: dedupeEntries(entries),
    unmatched,
  };
}

async function scrapeHills(
  csvRows: CsvFeedRow[],
  delayMs: number,
): Promise<GuideCacheFile> {
  if (!existsSync(HILLS_SCRAPED_PATH)) {
    throw new Error(`힐스 URL 목록 없음: ${HILLS_SCRAPED_PATH}`);
  }
  const hillsList = JSON.parse(readFileSync(HILLS_SCRAPED_PATH, "utf-8")) as {
    url: string;
    title: string;
    form: string;
  }[];

  const entries: GuideCacheEntry[] = [];
  const unmatched: GuideCacheFile["unmatched"] = [];
  const dryUrls = [
    ...hillsList.filter((p) => p.form === "dry"),
    ...HILLS_EXTRA_DRY_URLS.filter(
      (url) => !hillsList.some((p) => p.url === url),
    ).map((url) => ({
      url,
      title: url.split("/").pop() ?? url,
      form: "dry" as const,
    })),
  ];
  console.log(`[Hills] ${dryUrls.length}개 건식 URL 스크래핑…`);

  for (const item of dryUrls) {
    let html: string;
    try {
      html = await fetch(item.url, {
        headers: {
          ...FETCH_HEADERS,
          Referer: "https://www.hillspet.co.kr/cat-food",
        },
      }).then((r) => r.text());
    } catch (e) {
      unmatched.push({
        brand: "힐스",
        title: item.title,
        url: item.url,
        reason: `fetch 실패: ${e}`,
      });
      await sleep(delayMs);
      continue;
    }
    await sleep(delayMs);

    const parsed = parseHillsFeedingHtml(html);
    const pageTitle =
      html.match(/<title>([^<|]+)/)?.[1]?.trim() ??
      item.title.replace(/-/g, " ");
    const csvRow = matchHillsCsvRow(csvRows, pageTitle);
    if (!csvRow) {
      unmatched.push({
        brand: "힐스",
        title: item.title,
        url: item.url,
        reason: "CSV 매칭 실패",
      });
      continue;
    }
    if (!parsed) {
      unmatched.push({
        brand: "힐스",
        title: item.title,
        url: item.url,
        reason: "급여표 파싱 실패",
      });
      continue;
    }

    const targetKg = defaultGuideWeightKg(csvRow.lifeStage);
    const picked = pickGuideGrams(parsed, targetKg);
    if (!picked) {
      unmatched.push({
        brand: "힐스",
        title: item.title,
        url: item.url,
        reason: "기준 체중 행 없음",
      });
      continue;
    }

    if (
      picked.dailyGrams < MIN_DAILY_GRAMS ||
      picked.dailyGrams > MAX_DAILY_GRAMS
    ) {
      unmatched.push({
        brand: "힐스",
        title: item.title,
        url: item.url,
        reason: `비현실적 급여량 ${picked.dailyGrams}g`,
      });
      continue;
    }

    entries.push({
      feedId: csvRow.id,
      brand: csvRow.brand,
      name: csvRow.name,
      guideDailyG: picked.dailyGrams,
      guideWeightKg: targetKg,
      source: "hillspet.co.kr",
      sourceUrl: item.url,
      scrapedTitle: item.title,
    });
    console.log(
      `  ✓ ${csvRow.name}: ${targetKg}kg → ${picked.dailyGrams}g/일`,
    );
  }

  return {
    updatedAt: new Date().toISOString(),
    entries: dedupeEntries(entries),
    unmatched,
  };
}

function dedupeEntries(entries: GuideCacheEntry[]): GuideCacheEntry[] {
  const byId = new Map<string, GuideCacheEntry>();
  for (const e of entries) {
    const prev = byId.get(e.feedId);
    if (!prev) {
      byId.set(e.feedId, e);
      continue;
    }
    // 동일 사료에 여러 슬러그가 매칭되면 더 그럴듯한(중간대) 값 유지
    const prevOk =
      prev.guideDailyG >= MIN_DAILY_GRAMS && prev.guideDailyG <= MAX_DAILY_GRAMS;
    const nextOk =
      e.guideDailyG >= MIN_DAILY_GRAMS && e.guideDailyG <= MAX_DAILY_GRAMS;
    if (!prevOk && nextOk) byId.set(e.feedId, e);
    else if (prevOk && nextOk && e.scrapedTitle && prev.scrapedTitle) {
      // 한글 제목이 있는 쪽 우선
      const eKo = /[가-힣]/.test(e.scrapedTitle);
      const pKo = /[가-힣]/.test(prev.scrapedTitle);
      if (eKo && !pKo) byId.set(e.feedId, e);
    }
  }
  return [...byId.values()];
}

function mergeCaches(parts: GuideCacheFile[]): GuideCacheFile {
  const entries: GuideCacheEntry[] = [];
  const unmatched: GuideCacheFile["unmatched"] = [];
  for (const part of parts) {
    entries.push(...part.entries);
    unmatched.push(...part.unmatched);
  }
  return {
    updatedAt: new Date().toISOString(),
    entries: dedupeEntries(entries),
    unmatched,
  };
}

function copyGuideBetweenRows(
  rows: CsvFeedRow[],
  targetId: string,
  sourceId: string,
): boolean {
  const target = rows.find((r) => r.id === targetId);
  const source = rows.find((r) => r.id === sourceId);
  if (!target || !source || target.type !== "dry") return false;
  if (target.guideDailyG.trim() !== "") return false;
  if (!source.guideDailyG.trim() || !source.guideWeightKg.trim()) return false;
  target.guideDailyG = source.guideDailyG;
  target.guideWeightKg = source.guideWeightKg;
  return true;
}

function finalizeHillsGuides(rows: CsvFeedRow[]): number {
  let updated = 0;
  if (copyGuideBetweenRows(rows, "HP1810-GI-BIOME", "HP1810-GI-STRESS")) {
    updated++;
  }
  updated += propagateHillsLegacyGuides(rows);
  return updated;
}

function applyToCsv(
  csvRows: CsvFeedRow[],
  cache: GuideCacheFile,
  opts: { dryRun: boolean; force: boolean },
): { updated: number; skipped: number } {
  const byId = new Map(cache.entries.map((e) => [e.feedId, e]));
  let updated = 0;
  let skipped = 0;

  for (const row of csvRows) {
    if (row.type !== "dry") continue;
    const entry = byId.get(row.id);
    if (!entry) continue;

    const hasGuide = row.guideDailyG.trim() !== "";
    if (hasGuide && !opts.force) {
      skipped++;
      continue;
    }

    row.guideDailyG = String(entry.guideDailyG);
    row.guideWeightKg = String(entry.guideWeightKg);
    updated++;
  }

  if (!opts.dryRun && updated > 0) {
    writeCatFoodCsv(csvRows, resolveCsvPath());
  }

  return { updated, skipped };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const csvRows = loadCatFoodCsv(resolveCsvPath());
  const dryCount = csvRows.filter((r) => r.type === "dry").length;
  const filledBefore = csvRows.filter(
    (r) => r.type === "dry" && r.guideDailyG.trim() !== "",
  ).length;

  console.log(`건식 ${dryCount}종 (기존 가이드 ${filledBefore}종)`);

  let cache: GuideCacheFile | null = null;

  if (!args.applyOnly) {
    const parts: GuideCacheFile[] = [];
    if (!args.brand || args.brand.includes("로얄")) {
      parts.push(await scrapeRoyalCanin(csvRows, args.delayMs));
    }
    if (!args.brand || args.brand.includes("힐스")) {
      parts.push(await scrapeHills(csvRows, args.delayMs));
    }
    cache = mergeCaches(parts);

    // 브랜드 필터 시 다른 브랜드 캐시 유지
    if (args.brand && existsSync(CACHE_PATH)) {
      const prev = JSON.parse(
        readFileSync(CACHE_PATH, "utf-8"),
      ) as GuideCacheFile;
      const keepBrand = args.brand.includes("로얄") ? "힐스" : "로얄캐닌";
      const kept = prev.entries.filter((e) => e.brand === keepBrand);
      cache = mergeCaches([
        { updatedAt: cache.updatedAt, entries: cache.entries, unmatched: cache.unmatched },
        { updatedAt: prev.updatedAt, entries: kept, unmatched: [] },
      ]);
    }

    if (!args.dryRun) {
      writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), "utf-8");
      console.log(`\n캐시 저장: ${CACHE_PATH}`);
    }

    console.log(
      `\n스크래핑 완료: ${cache.entries.length}건 매칭, ${cache.unmatched.length}건 실패`,
    );
    if (cache.unmatched.length > 0) {
      console.log("실패 샘플:");
      for (const u of cache.unmatched.slice(0, 12)) {
        console.log(`  - [${u.brand}] ${u.title}: ${u.reason}`);
      }
      if (cache.unmatched.length > 12) {
        console.log(`  … 외 ${cache.unmatched.length - 12}건`);
      }
    }
  } else {
    if (!existsSync(CACHE_PATH)) {
      throw new Error(`캐시 없음. 먼저 --scrape-only 없이 실행하세요: ${CACHE_PATH}`);
    }
    cache = JSON.parse(readFileSync(CACHE_PATH, "utf-8")) as GuideCacheFile;
    console.log(`캐시 로드: ${cache.entries.length}건`);
  }

  if (!args.scrapeOnly && cache) {
    const { updated, skipped } = applyToCsv(csvRows, cache, {
      dryRun: args.dryRun,
      force: args.force,
    });
    console.log(
      `\nCSV ${args.dryRun ? "(dry-run) " : ""}반영: ${updated}건 갱신, ${skipped}건 스킵(기존값 유지)`,
    );

    const hillsFinalized = args.dryRun ? 0 : finalizeHillsGuides(csvRows);
    if (hillsFinalized > 0 && !args.dryRun) {
      writeCatFoodCsv(csvRows, resolveCsvPath());
      console.log(`힐스 레거시·동일 제품 가이드 ${hillsFinalized}건 추가 반영`);
    }

    if (!args.dryRun) {
      const after = loadCatFoodCsv(resolveCsvPath()).filter(
        (r) => r.type === "dry" && r.guideDailyG.trim() !== "",
      ).length;
      console.log(`건식 가이드 채움: ${after}/${dryCount}종`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
