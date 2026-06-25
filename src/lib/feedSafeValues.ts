/** optional/null CSV·API 필드 — Food Search·Detail 공용 */

export function safeString(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return "";
}

export function safeLower(value: unknown): string {
  return safeString(value).trim().toLowerCase();
}

export function hasValidNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function safeNumber(value: unknown): number | null {
  if (hasValidNumber(value)) return value;
  const raw = safeString(value).trim();
  if (!raw) return null;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : null;
}

export function formatKcalPer100gLabel(value: unknown): string {
  const n = safeNumber(value);
  if (n == null) return "칼로리 정보 준비 중";
  const display = Number.isInteger(n) ? n : Math.round(n * 10) / 10;
  return `100g당 ${display}kcal`;
}

export function formatServingGramsLabel(value: unknown): string {
  const n = safeNumber(value);
  if (n == null) return "기준 급여량 정보 준비 중";
  return formatGramsValue(n);
}

function formatGramsValue(n: number): string {
  const display = Number.isInteger(n) ? n : Math.round(n * 10) / 10;
  return `${display}g`;
}

function formatWeightKgValue(n: number): string {
  return Number.isInteger(n) ? `${n}kg` : `${Math.round(n * 10) / 10}kg`;
}

function isWetFeedKind(feedKind: string | null | undefined): boolean {
  const x = safeString(feedKind).trim().toLowerCase();
  return x === "습식" || x === "wet";
}

export type FeedServingDisplay = {
  label: string;
  value: string;
};

/** 습식=1팩 용량, 건식=브랜드 급여 가이드(일일 g) */
export function formatFeedServingDisplay(feed: {
  feedKind: string;
  servingGrams?: number | null;
  servingGuideGrams?: number | null;
  servingGuideWeightKg?: number | null;
}): FeedServingDisplay {
  if (isWetFeedKind(feed.feedKind)) {
    return {
      label: "1팩·1캔 기준",
      value: formatServingGramsLabel(feed.servingGrams),
    };
  }

  const guideG = safeNumber(feed.servingGuideGrams);
  if (guideG != null) {
    const weightKg = safeNumber(feed.servingGuideWeightKg) ?? 4;
    return {
      label: "브랜드 급여 가이드",
      value: `${formatWeightKgValue(weightKg)} 기준 약 ${formatGramsValue(guideG)}/일`,
    };
  }

  return {
    label: "브랜드 급여 가이드",
    value: "브랜드 급여 가이드 준비 중",
  };
}

export function getFoodDetailPathSegment(
  item: { slug?: string | null; id?: string | null },
): string | null {
  const slug = safeString(item.slug).trim();
  if (slug) return slug;
  const id = safeString(item.id).trim();
  return id || null;
}
