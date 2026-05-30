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

function humanizeToken(raw: string): string {
  return raw
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function feedTypeLabel(rawType: string, feedKind?: string): string {
  const key = rawType.trim().toLowerCase();
  if (FEED_TYPE_LABELS[key]) return FEED_TYPE_LABELS[key];
  if (feedKind?.trim()) return feedKind.trim();
  return humanizeToken(rawType) || "—";
}

export function lifeStageLabel(lifeStage: string | null | undefined): string {
  if (!lifeStage?.trim()) return "—";
  const key = lifeStage.trim().toLowerCase();
  return LIFE_STAGE_LABELS[key] ?? humanizeToken(key);
}

export function feedCategoryLabel(category: string | null | undefined): string {
  if (!category?.trim()) return "—";
  const key = category.trim().toLowerCase();
  return CATEGORY_LABELS[key] ?? humanizeToken(key);
}

export function feedConditionLabel(
  condition: string | null | undefined,
): string {
  if (!condition?.trim()) return "—";
  const key = condition.trim().toLowerCase();
  return CONDITION_LABELS[key] ?? humanizeToken(key);
}

export function formatServingGrams(
  servingGrams: number | null | undefined,
  feedKind: string,
): string {
  if (servingGrams == null || !Number.isFinite(servingGrams)) {
    return feedKind === "습식" ? "—" : "해당 없음";
  }
  const n = servingGrams;
  return Number.isInteger(n) ? `${n}g` : `${n}g`;
}
