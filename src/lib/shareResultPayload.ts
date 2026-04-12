import type { CalculatorSuccess, CalorieStatus } from "@/lib/calculator";

const VERSION = 1 as const;

export type ShareResultPayloadV1 = {
  v: typeof VERSION;
  status: CalorieStatus;
  recommendedCalories: number;
  totalCalories: number;
  foodCalories: number;
  snackCalories: number;
  diffPercent: number;
};

const STATUSES: readonly CalorieStatus[] = [
  "balanced",
  "slightly_high",
  "high",
  "slightly_low",
  "low",
] as const;

function isStatus(x: unknown): x is CalorieStatus {
  return typeof x === "string" && (STATUSES as readonly string[]).includes(x);
}

function finiteNum(x: unknown): x is number {
  return typeof x === "number" && Number.isFinite(x);
}

function parsePayload(raw: unknown): ShareResultPayloadV1 | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (o.v !== VERSION) return null;
  if (!isStatus(o.status)) return null;
  if (
    !finiteNum(o.recommendedCalories) ||
    !finiteNum(o.totalCalories) ||
    !finiteNum(o.foodCalories) ||
    !finiteNum(o.snackCalories) ||
    !finiteNum(o.diffPercent)
  ) {
    return null;
  }
  const cap = 1e6;
  const nums = [
    o.recommendedCalories,
    o.totalCalories,
    o.foodCalories,
    o.snackCalories,
  ];
  if (nums.some((n) => n < 0 || n > cap)) return null;
  if (o.diffPercent < -1000 || o.diffPercent > 1000) return null;
  return {
    v: VERSION,
    status: o.status,
    recommendedCalories: o.recommendedCalories,
    totalCalories: o.totalCalories,
    foodCalories: o.foodCalories,
    snackCalories: o.snackCalories,
    diffPercent: o.diffPercent,
  };
}

function utf8ToBase64Url(json: string): string {
  const bytes = new TextEncoder().encode(json);
  let bin = "";
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  const b64 = btoa(bin);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToUtf8(s: string): string {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function encodeShareResultPayload(success: CalculatorSuccess): string {
  const payload: ShareResultPayloadV1 = {
    v: VERSION,
    status: success.status,
    recommendedCalories: success.recommendedCalories,
    totalCalories: success.totalCalories,
    foodCalories: success.foodCalories,
    snackCalories: success.snackCalories,
    diffPercent: success.diffPercent,
  };
  return utf8ToBase64Url(JSON.stringify(payload));
}

export function decodeShareResultPayload(
  encoded: string,
): { ok: true; value: ShareResultPayloadV1 } | { ok: false } {
  const trimmed = encoded.trim();
  if (!trimmed) return { ok: false };
  try {
    const json = base64UrlToUtf8(trimmed);
    const parsed = JSON.parse(json) as unknown;
    const value = parsePayload(parsed);
    if (!value) return { ok: false };
    return { ok: true, value };
  } catch {
    return { ok: false };
  }
}

/** 공유 링크 전용: 화면에 필요한 필드만 채우고 나머지는 더미 */
export function sharePayloadToCalculatorSuccess(
  p: ShareResultPayloadV1,
): CalculatorSuccess {
  return {
    ok: true,
    rer: 0,
    baseFactor: 0,
    bodyFactor: 0,
    activityFactor: 0,
    recommendedCalories: p.recommendedCalories,
    foodCalories: p.foodCalories,
    snackCalories: p.snackCalories,
    totalCalories: p.totalCalories,
    diffPercent: p.diffPercent,
    status: p.status,
    ageMonths: 0,
  };
}
