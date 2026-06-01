import type { CatalogItem } from "@/components/wireframe/CatalogSearchModal";

export const FEED_FIND_CHIPS = [
  "전체",
  "건식",
  "습식",
  "키튼",
  "성묘",
  "체중관리",
  "헤어볼",
  "처방식",
] as const;

export type FeedFindChip = (typeof FEED_FIND_CHIPS)[number];

function norm(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

/** 사료 찾기 페이지 필터 — CSV type/life_stage/category/condition 기준 */
export function matchesFeedFindChip(
  item: CatalogItem,
  chip: FeedFindChip,
): boolean {
  if (chip === "전체") return true;

  const feedKind = norm(item.feedKind);
  const rawType = norm(item.rawType);
  const lifeStage = norm(item.lifeStage);
  const category = norm(item.category);
  const condition = norm(item.feedCondition);

  switch (chip) {
    case "건식":
      return feedKind.includes("건") || rawType === "dry";
    case "습식":
      return feedKind.includes("습") || rawType === "wet";
    case "키튼":
      return lifeStage.includes("kitten");
    case "성묘":
      return (
        lifeStage.includes("adult") ||
        lifeStage.includes("all_life") ||
        lifeStage.includes("all")
      );
    case "체중관리":
      return (
        condition === "weight" ||
        lifeStage.includes("weight") ||
        condition === "diet"
      );
    case "헤어볼":
      return condition === "hairball";
    case "처방식":
      return category === "prescription" || category === "medical";
    default:
      return true;
  }
}

export function filterCatalogByChip(
  items: CatalogItem[],
  chip: FeedFindChip,
): CatalogItem[] {
  return items.filter((item) => matchesFeedFindChip(item, chip));
}
