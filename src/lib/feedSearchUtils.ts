import type { CatalogItem } from "@/components/wireframe/CatalogSearchModal";
import { safeLower, safeString } from "@/lib/feedSafeValues";
import {
  compactForSearch,
  isIngredientToken,
  matchesParsedQuery,
  matchesStructuredToken,
  parseSearchQuery,
} from "@/lib/feedSearchNormalize";

export { compactForSearch } from "@/lib/feedSearchNormalize";

export const FEED_PAGE_PLACEHOLDER = "사료명, 브랜드, 건식·전연령·치킨 등으로 검색";
export const FEED_MODAL_PLACEHOLDER = "예: 아카나";

const SIMILAR_RESULTS_LIMIT = 24;

function norm(value: unknown): string {
  return safeLower(value);
}

function fieldSynonyms(row: CatalogItem): string[] {
  const parts: string[] = [];
  const rawType = norm(row.rawType);
  const lifeStage = norm(row.lifeStage);
  const condition = norm(row.feedCondition);
  const category = norm(row.category);
  const feedKind = norm(row.feedKind);

  if (rawType === "dry" || feedKind.includes("건")) {
    parts.push("건식", "dry");
  }
  if (rawType === "wet" || feedKind.includes("습")) {
    parts.push("습식", "wet");
  }
  if (lifeStage.includes("all_life")) {
    parts.push("전연령", "all_life_stage");
  }
  if (lifeStage.includes("kitten")) {
    parts.push("키튼", "새끼고양이", "kitten");
  }
  if (lifeStage.includes("adult")) {
    parts.push("성묘", "어덜트", "adult");
  }
  if (lifeStage.includes("senior")) {
    parts.push("시니어", "노령묘", "senior");
  }
  if (condition === "weight" || condition === "diet") {
    parts.push("체중관리", "다이어트", "weight");
  }
  if (condition === "hairball") {
    parts.push("헤어볼", "hairball");
  }
  if (category === "prescription" || category === "medical") {
    parts.push("처방식", "prescription");
  }

  const rawTypeStr = safeString(row.rawType).trim();
  const lifeStageStr = safeString(row.lifeStage).trim();
  const categoryStr = safeString(row.category).trim();
  const conditionStr = safeString(row.feedCondition).trim();
  if (rawTypeStr) parts.push(rawTypeStr);
  if (lifeStageStr) parts.push(lifeStageStr);
  if (categoryStr) parts.push(categoryStr);
  if (conditionStr) parts.push(conditionStr);

  return parts;
}

function isCatalogItem(value: unknown): value is CatalogItem {
  return value != null && typeof value === "object";
}

/** brand · name · type · life_stage · category · condition · ingredients · features */
export function catalogSearchBlob(row: unknown): string {
  if (!isCatalogItem(row)) return "";

  return [
    row.label,
    row.nameEn,
    row.nameKo,
    row.displayLabel,
    row.brand,
    row.name,
    row.category,
    row.feedCondition,
    row.feedKind,
    row.rawType,
    row.lifeStage,
    row.ingredients,
    row.features,
    row.nutritionAnalysis,
    ...fieldSynonyms(row),
  ]
    .map(safeString)
    .filter((x) => x.trim() !== "")
    .join(" ");
}

export function filterCatalogByQuery(
  catalog: unknown,
  query: unknown,
): CatalogItem[] {
  try {
    const items = Array.isArray(catalog)
      ? catalog.filter(isCatalogItem)
      : [];
    const trimmed = safeString(query).trim();
    if (!trimmed) return items;

    const parsed = parseSearchQuery(trimmed);
    if (
      parsed.structuredTokens.length === 0 &&
      parsed.textTokens.length === 0
    ) {
      const needle = compactForSearch(trimmed);
      if (!needle) return items;
      return items.filter((row) =>
        compactForSearch(catalogSearchBlob(row)).includes(needle),
      );
    }

    return items.filter((row) => {
      const blob = compactForSearch(catalogSearchBlob(row));
      return matchesParsedQuery(row, parsed, blob);
    });
  } catch (error) {
    console.warn("[feedSearch] filterCatalogByQuery failed:", error);
    return [];
  }
}

/**
 * 정확히 일치하는 결과가 없을 때 type/life_stage/condition/원료 기준 부분 일치.
 */
export function findSimilarCatalogResults(
  catalog: unknown,
  query: unknown,
): CatalogItem[] {
  try {
    const items = Array.isArray(catalog)
      ? catalog.filter(isCatalogItem)
      : [];
    const trimmed = safeString(query).trim();
    if (!trimmed) return [];

    const parsed = parseSearchQuery(trimmed);

    if (parsed.structuredTokens.length > 0) {
      const byStructured = items.filter((item) =>
        parsed.structuredTokens.every((token) =>
          matchesStructuredToken(item, token),
        ),
      );
      if (byStructured.length > 0) {
        return byStructured.slice(0, SIMILAR_RESULTS_LIMIT);
      }
    }

    const ingredientTokens = parsed.structuredTokens.filter(isIngredientToken);
    if (ingredientTokens.length > 0) {
      const byIngredient = items.filter((item) =>
        ingredientTokens.some((token) => matchesStructuredToken(item, token)),
      );
      if (byIngredient.length > 0) {
        return byIngredient.slice(0, SIMILAR_RESULTS_LIMIT);
      }
    }

    if (parsed.textTokens.length > 0) {
      const byText = items.filter((item) => {
        const blob = compactForSearch(catalogSearchBlob(item));
        return parsed.textTokens.some((text) =>
          blob.includes(compactForSearch(text)),
        );
      });
      if (byText.length > 0) {
        return byText.slice(0, SIMILAR_RESULTS_LIMIT);
      }
    }

    const needle = compactForSearch(trimmed);
    if (needle.length >= 2) {
      const bySubstring = items.filter((item) =>
        compactForSearch(catalogSearchBlob(item)).includes(needle),
      );
      return bySubstring.slice(0, SIMILAR_RESULTS_LIMIT);
    }

    return [];
  } catch (error) {
    console.warn("[feedSearch] findSimilarCatalogResults failed:", error);
    return [];
  }
}
