import { canonicalizeKoreanSearchSpelling } from "@/lib/koreanSearchNormalize";
import { safeLower, safeString } from "@/lib/feedSafeValues";
import type { CatalogItem } from "@/components/wireframe/CatalogSearchModal";

export function compactForSearch(value: unknown): string {
  const s = safeString(value);
  if (!s) return "";
  return canonicalizeKoreanSearchSpelling(s)
    .normalize("NFC")
    .toLowerCase()
    .replace(/[\s\-_/·.,]+/gu, "");
}

/** 구조화 검색 토큰 — CSV type / life_stage / condition / category / 원료 */
export type StructuredSearchToken =
  | "dry"
  | "wet"
  | "all_life_stage"
  | "kitten"
  | "adult"
  | "senior"
  | "weight"
  | "hairball"
  | "prescription"
  | "chicken"
  | "tuna"
  | "salmon";

export type ParsedSearchQuery = {
  structuredTokens: StructuredSearchToken[];
  /** 키워드 추출 후 남은 자유 텍스트 (브랜드·제품명 등) */
  textTokens: string[];
};

type KeywordRule = {
  token: StructuredSearchToken;
  /** compactForSearch 적용 후 비교할 패턴 */
  patterns: string[];
};

/** 긴 패턴 우선 — 「건식전연령」 등 붙여 쓴 검색어 분리 */
const KEYWORD_RULES: KeywordRule[] = [
  {
    token: "all_life_stage",
    patterns: ["전연령", "alllifestage", "all_life_stage"],
  },
  { token: "kitten", patterns: ["새끼고양이", "키튼", "kitten"] },
  { token: "senior", patterns: ["노령묘", "시니어", "senior"] },
  { token: "adult", patterns: ["성묘", "어덜트", "adult"] },
  { token: "weight", patterns: ["체중관리", "다이어트", "weight", "diet"] },
  { token: "hairball", patterns: ["헤어볼", "hairball"] },
  { token: "prescription", patterns: ["처방식", "prescription", "medical"] },
  { token: "chicken", patterns: ["닭고기", "치킨", "chicken", "닭"] },
  { token: "tuna", patterns: ["참치", "tuna"] },
  { token: "salmon", patterns: ["연어", "salmon"] },
  { token: "dry", patterns: ["건식", "dry"] },
  { token: "wet", patterns: ["습식", "wet"] },
];

const SORTED_KEYWORD_PATTERNS = KEYWORD_RULES.flatMap((rule) =>
  rule.patterns.map((pattern) => ({
    compact: compactForSearch(pattern),
    token: rule.token,
  })),
).sort((a, b) => b.compact.length - a.compact.length);

const INGREDIENT_TOKENS = new Set<StructuredSearchToken>([
  "chicken",
  "tuna",
  "salmon",
]);

const CHICKEN_NEEDLES = ["chicken", "치킨", "닭"].map(compactForSearch);
const TUNA_NEEDLES = ["tuna", "참치"].map(compactForSearch);
const SALMON_NEEDLES = ["salmon", "연어"].map(compactForSearch);

function norm(value: unknown): string {
  return safeLower(value);
}

function blobIncludesAny(blob: string, needles: string[]): boolean {
  if (!blob) return false;
  return needles.some((needle) => needle && blob.includes(needle));
}

/** 검색어 → 구조화 토큰 + 자유 텍스트 토큰 */
export function parseSearchQuery(query: unknown): ParsedSearchQuery {
  const compact = compactForSearch(query);
  if (!compact) {
    return { structuredTokens: [], textTokens: [] };
  }

  const structuredTokens: StructuredSearchToken[] = [];
  let remaining = compact;

  let progress = true;
  while (progress && remaining.length > 0) {
    progress = false;
    for (const { compact: pattern, token } of SORTED_KEYWORD_PATTERNS) {
      if (!pattern) continue;
      const idx = remaining.indexOf(pattern);
      if (idx >= 0) {
        structuredTokens.push(token);
        remaining =
          remaining.slice(0, idx) + remaining.slice(idx + pattern.length);
        progress = true;
        break;
      }
    }
  }

  const uniqueStructured = [...new Set(structuredTokens)];
  const textTokens: string[] = remaining.length > 0 ? [remaining] : [];

  return { structuredTokens: uniqueStructured, textTokens };
}

function ingredientBlob(item: CatalogItem | null | undefined): string {
  if (!item || typeof item !== "object") return "";
  return [
    item.name,
    item.brand,
    item.label,
    item.displayLabel,
    item.ingredients,
    item.features,
  ]
    .map(safeString)
    .filter((x) => x.trim() !== "")
    .join(" ");
}

export function matchesStructuredToken(
  item: CatalogItem | null | undefined,
  token: StructuredSearchToken,
): boolean {
  if (!item || typeof item !== "object") return false;

  const feedKind = norm(item.feedKind);
  const rawType = norm(item.rawType);
  const lifeStage = norm(item.lifeStage);
  const category = norm(item.category);
  const condition = norm(item.feedCondition);
  const ingredientCompact = compactForSearch(ingredientBlob(item));

  switch (token) {
    case "dry":
      return feedKind.includes("건") || rawType === "dry";
    case "wet":
      return feedKind.includes("습") || rawType === "wet";
    case "all_life_stage":
      return lifeStage.includes("all_life");
    case "kitten":
      return lifeStage.includes("kitten");
    case "adult":
      return (
        lifeStage.includes("adult") ||
        lifeStage.includes("all_life") ||
        lifeStage === "all"
      );
    case "senior":
      return lifeStage.includes("senior");
    case "weight":
      return (
        condition === "weight" ||
        condition === "diet" ||
        lifeStage.includes("weight")
      );
    case "hairball":
      return condition === "hairball";
    case "prescription":
      return category === "prescription" || category === "medical";
    case "chicken":
      return blobIncludesAny(ingredientCompact, CHICKEN_NEEDLES);
    case "tuna":
      return blobIncludesAny(ingredientCompact, TUNA_NEEDLES);
    case "salmon":
      return blobIncludesAny(ingredientCompact, SALMON_NEEDLES);
    default:
      return false;
  }
}

export function isIngredientToken(
  token: StructuredSearchToken,
): token is "chicken" | "tuna" | "salmon" {
  return INGREDIENT_TOKENS.has(token);
}

export function matchesParsedQuery(
  item: CatalogItem | null | undefined,
  parsed: ParsedSearchQuery,
  searchBlob: string,
): boolean {
  if (!item || typeof item !== "object") return false;

  for (const token of parsed.structuredTokens) {
    if (!matchesStructuredToken(item, token)) return false;
  }

  for (const text of parsed.textTokens) {
    const needle = compactForSearch(text);
    if (needle && !searchBlob.includes(needle)) return false;
  }

  return parsed.structuredTokens.length > 0 || parsed.textTokens.length > 0;
}
