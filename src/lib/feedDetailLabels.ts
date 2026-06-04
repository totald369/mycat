import {
  formatServingGramsLabel,
  safeLower,
  safeString,
} from "@/lib/feedSafeValues";

const FEED_TYPE_LABELS: Record<string, string> = {
  dry: "건식",
  wet: "습식",
  건식: "건식",
  습식: "습식",
};

const LIFE_STAGE_LABELS: Record<string, string> = {
  all_life_stage: "전연령",
  all: "전연령",
  adult_1y_plus: "성묘 (1세 이상)",
  adult_1_6y: "성묘 (1~6세)",
  adult_1_7y: "성묘 (1~7세)",
  adult_1_7y_neutered: "중성화 성묘 (1~7세)",
  adult_indoor: "실내 성묘",
  adult_sensitive: "민감한 성묘",
  kitten_0_12m: "키튼 (0~12개월)",
  kitten_0_4m: "키튼 (0~4개월)",
  kitten_4_12m: "키튼 (4~12개월)",
  kitten_6_12m_neutered: "중성화 키튼 (6~12개월)",
  kittens: "키튼",
  senior_7y_plus: "노묘 (7세 이상)",
  senior_11y_plus: "노묘 (11세 이상)",
  senior_15y_plus: "노묘 (15세 이상)",
  weight_control: "체중 관리",
};

const CATEGORY_LABELS: Record<string, string> = {
  general: "일반 사료",
  prescription: "처방 사료",
  medical: "의료 사료",
};

const CONDITION_LABELS: Record<string, string> = {
  none: "해당 없음",
  weight: "체중 관리",
  digestive: "소화기",
  digestion: "소화기",
  urinary: "요로",
  kidney: "신장",
  renal: "신장",
  palatability: "기호성",
  allergy: "알레르기",
  skin: "피부",
  skin_allergy: "피부·알레르기",
  high_protein: "고단백",
  hairball: "헤어볼",
  senior: "노묘",
  adult: "성묘",
  dental: "치아",
  recovery: "회복기",
  diabetes: "당뇨",
  liver: "간",
  growth: "성장",
  korshort: "코리안 숏헤어",
  low_fat: "저지방",
  diet: "다이어트",
  indoor: "실내",
  kitten: "키튼",
};

function humanizeToken(raw: unknown): string {
  return safeString(raw)
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function feedTypeLabel(
  rawType: string | null | undefined,
  feedKind?: string | null,
): string {
  const key = safeLower(rawType);
  if (key && FEED_TYPE_LABELS[key]) return FEED_TYPE_LABELS[key];
  const kind = safeString(feedKind).trim();
  if (kind) return kind;
  const token = humanizeToken(rawType);
  return token || "—";
}

export function lifeStageLabel(lifeStage: string | null | undefined): string {
  const trimmed = safeString(lifeStage).trim();
  if (!trimmed) return "—";
  const key = trimmed.toLowerCase();
  return LIFE_STAGE_LABELS[key] ?? humanizeToken(key);
}

export function feedCategoryLabel(category: string | null | undefined): string {
  const trimmed = safeString(category).trim();
  if (!trimmed) return "—";
  const key = trimmed.toLowerCase();
  return CATEGORY_LABELS[key] ?? humanizeToken(key);
}

export function feedConditionLabel(
  condition: string | null | undefined,
): string {
  const trimmed = safeString(condition).trim();
  if (!trimmed) return "—";
  const key = trimmed.toLowerCase();
  return CONDITION_LABELS[key] ?? humanizeToken(key);
}

/** 카드·칩용 짧은 라벨 */
export function lifeStageShortLabel(
  lifeStage: string | null | undefined,
): string | null {
  const key = safeLower(lifeStage);
  if (!key) return null;
  if (key.includes("kitten")) return "키튼";
  if (key.includes("senior")) return "노묘";
  if (key.includes("adult")) return "성묘";
  if (key.includes("all_life") || key === "all") return "전연령";
  return null;
}

export function conditionShortLabel(
  condition: string | null | undefined,
): string | null {
  const key = safeLower(condition);
  if (!key) return null;
  if (key === "none") return null;
  if (key === "hairball") return "헤어볼";
  if (key === "weight" || key === "diet") return "체중관리";
  return CONDITION_LABELS[key] ?? null;
}

export function categoryShortLabel(
  category: string | null | undefined,
): string | null {
  const key = safeLower(category);
  if (!key) return null;
  if (key === "general") return null;
  if (key === "prescription" || key === "medical") return "처방식";
  return CATEGORY_LABELS[key] ?? null;
}

export function formatServingGrams(
  servingGrams: number | null | undefined,
): string {
  return formatServingGramsLabel(servingGrams);
}
