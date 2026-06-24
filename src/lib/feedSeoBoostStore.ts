import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type {
  FeedSeoBoostCacheFile,
  FeedSeoBoostContentData,
} from "@/lib/feedSeoBoostTypes";

const CACHE_PATH = join(process.cwd(), "prisma", "feedSeoBoost.json");

let memoryCache: FeedSeoBoostCacheFile | null = null;

function emptyCache(): FeedSeoBoostCacheFile {
  return {
    version: 1,
    exportedAt: new Date(0).toISOString(),
    pilotFeedApiIds: [],
    contents: {},
  };
}

export function loadFeedSeoBoostCache(): FeedSeoBoostCacheFile {
  if (memoryCache) return memoryCache;
  if (!existsSync(CACHE_PATH)) {
    memoryCache = emptyCache();
    return memoryCache;
  }
  try {
    const raw = readFileSync(CACHE_PATH, "utf8");
    const parsed = JSON.parse(raw) as FeedSeoBoostCacheFile;
    memoryCache = {
      version: parsed.version ?? 1,
      exportedAt: parsed.exportedAt ?? new Date(0).toISOString(),
      pilotFeedApiIds: parsed.pilotFeedApiIds ?? [],
      contents: Object.fromEntries(
        Object.entries(parsed.contents ?? {}).map(([id, item]) => [
          id,
          { ...item, source: item.source ?? "rule" },
        ]),
      ),
    };
    return memoryCache;
  } catch {
    memoryCache = emptyCache();
    return memoryCache;
  }
}

export function getFeedSeoBoostContent(
  feedApiId: string,
): FeedSeoBoostContentData | null {
  const id = feedApiId.trim();
  if (!id) return null;
  const cache = loadFeedSeoBoostCache();
  return cache.contents[id] ?? null;
}

export function isFeedSeoBoostPilot(feedApiId: string): boolean {
  const cache = loadFeedSeoBoostCache();
  return cache.pilotFeedApiIds.includes(feedApiId.trim());
}

export function writeFeedSeoBoostCache(data: FeedSeoBoostCacheFile): void {
  const payload: FeedSeoBoostCacheFile = {
    ...data,
    exportedAt: new Date().toISOString(),
  };
  writeFileSync(CACHE_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  memoryCache = payload;
}

export function getFeedSeoBoostCachePath(): string {
  return CACHE_PATH;
}
