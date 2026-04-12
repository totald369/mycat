import type { FeedCatalogItem } from "@/lib/wizardCalories";

export const FEED_CATALOG_PREFETCH_KEY = "mycat_feed_catalog_prefetch_v1";

/** 결과 페이지로 넘기기 직전에 호출 — 영상 재생과 병렬로 로드 */
export async function prefetchFeedCatalogForResult(): Promise<void> {
  const res = await fetch("/api/feeds");
  const data = (await res.json()) as {
    items?: FeedCatalogItem[];
    error?: string;
  };
  if (!res.ok) {
    throw new Error(data.error ?? "사료 목록을 불러오지 못했습니다.");
  }
  sessionStorage.setItem(
    FEED_CATALOG_PREFETCH_KEY,
    JSON.stringify({ items: data.items ?? [] }),
  );
}
