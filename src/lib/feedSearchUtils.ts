import { canonicalizeKoreanSearchSpelling } from "@/lib/koreanSearchNormalize";
import type { CatalogItem } from "@/components/wireframe/CatalogSearchModal";

export const FEED_PAGE_PLACEHOLDER = "사료명 또는 브랜드명을 검색해보세요";
export const FEED_MODAL_PLACEHOLDER = "예: 아카나";

export function compactForSearch(s: string): string {
  return canonicalizeKoreanSearchSpelling(s)
    .normalize("NFC")
    .toLowerCase()
    .replace(/[\s\-_/·.,]+/gu, "");
}

export function catalogSearchBlob(row: CatalogItem): string {
  return [
    row.label,
    row.nameEn,
    row.nameKo,
    row.displayLabel,
    row.brand,
    row.name,
    row.category,
    row.feedCondition,
  ]
    .filter((x): x is string => typeof x === "string" && x.trim() !== "")
    .join(" ");
}

export function filterCatalogByQuery(
  catalog: CatalogItem[],
  query: string,
): CatalogItem[] {
  const needle = compactForSearch(query);
  if (!needle) return catalog;
  return catalog.filter((row) =>
    compactForSearch(catalogSearchBlob(row)).includes(needle),
  );
}
