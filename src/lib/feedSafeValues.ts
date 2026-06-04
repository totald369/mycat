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
  return Number.isInteger(n) ? `${n}g` : `${n}g`;
}

export function getFoodDetailPathSegment(
  item: { slug?: string | null; id?: string | null },
): string | null {
  const slug = safeString(item.slug).trim();
  if (slug) return slug;
  const id = safeString(item.id).trim();
  return id || null;
}
