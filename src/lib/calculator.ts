/**
 * 고양이 급여 권장 칼로리·실제 섭취 비교 계산 (RER × 요인).
 */

export type GenderOption =
  | "male_intact"
  | "male_neutered"
  | "female_intact"
  | "female_neutered";

export type BodyType =
  | "very_thin"
  | "thin"
  | "normal"
  | "overweight"
  | "obese";

export type ActivityLevel = "low" | "normal" | "high";

export type SnackFrequency =
  | "none"
  | "daily"
  | "weekly_2_3"
  | "weekly_less_than_1";

export type FoodInput = {
  kcalPer100g: number;
  amountG: number;
  timesPerDay: number;
};

export type CalculatorInput = {
  /** YYYY-MM-DD */
  birthDate: string;
  genderOption: GenderOption;
  weightKg: number;
  bodyType: BodyType;
  activityLevel: ActivityLevel;
  foods: FoodInput[];
  snackFrequency: SnackFrequency;
};

export type CalorieStatus =
  | "balanced"
  | "slightly_high"
  | "high"
  | "slightly_low"
  | "low";

export type CalculatorSuccess = {
  ok: true;
  rer: number;
  baseFactor: number;
  bodyFactor: number;
  activityFactor: number;
  recommendedCalories: number;
  foodCalories: number;
  snackCalories: number;
  totalCalories: number;
  diffPercent: number;
  status: CalorieStatus;
  /** 계산에 사용된 만 나이(월) */
  ageMonths: number;
};

export type CalculatorError = {
  ok: false;
  error: string;
};

export type CalculatorOutput = CalculatorSuccess | CalculatorError;

// --- 나이 ---

function parseISODate(ymd: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const dt = new Date(y, mo, d);
  if (
    dt.getFullYear() !== y ||
    dt.getMonth() !== mo ||
    dt.getDate() !== d
  ) {
    return null;
  }
  return dt;
}

/**
 * 기준일 기준 완료된 개월 수 (생일이 아직 안 지났으면 1개월 차감).
 */
export function ageInCompletedMonths(
  birthDateStr: string,
  ref: Date = new Date(),
): number {
  const birth = parseISODate(birthDateStr);
  if (!birth) return NaN;
  const refDay = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const b = new Date(birth.getFullYear(), birth.getMonth(), birth.getDate());
  if (refDay < b) return 0;
  let months =
    (refDay.getFullYear() - b.getFullYear()) * 12 +
    (refDay.getMonth() - b.getMonth());
  if (refDay.getDate() < b.getDate()) months -= 1;
  return Math.max(0, months);
}

// --- 요인 ---

export function rerFromWeightKg(weightKg: number): number {
  return 70 * weightKg ** 0.75;
}

export function baseFactorFor(
  ageMonths: number,
  genderOption: GenderOption,
): number {
  if (ageMonths < 4) return 2.5;
  if (ageMonths < 12) return 2.0;
  if (ageMonths >= 84) return 1.1;
  const neutered =
    genderOption === "male_neutered" || genderOption === "female_neutered";
  return neutered ? 1.2 : 1.4;
}

export function bodyFactorFor(bodyType: BodyType): number {
  switch (bodyType) {
    case "very_thin":
      return 1.15;
    case "thin":
      return 1.1;
    case "normal":
      return 1.0;
    case "overweight":
      return 0.9;
    case "obese":
      return 0.8;
    default: {
      const _exhaustive: never = bodyType;
      return _exhaustive;
    }
  }
}

export function activityFactorFor(level: ActivityLevel): number {
  switch (level) {
    case "low":
      return 0.95;
    case "normal":
      return 1.0;
    case "high":
      return 1.1;
    default: {
      const _exhaustive: never = level;
      return _exhaustive;
    }
  }
}

export function snackPercentOfRecommended(
  freq: SnackFrequency,
): number {
  switch (freq) {
    case "none":
      return 0;
    case "daily":
      return 10;
    case "weekly_2_3":
      return 5;
    case "weekly_less_than_1":
      return 2;
    default: {
      const _exhaustive: never = freq;
      return _exhaustive;
    }
  }
}

export function foodCaloriesFromFoods(foods: FoodInput[]): number {
  let sum = 0;
  for (const f of foods) {
    const k = f.kcalPer100g;
    const g = f.amountG;
    const t = f.timesPerDay;
    if (!Number.isFinite(k) || !Number.isFinite(g) || !Number.isFinite(t))
      continue;
    sum += (k / 100) * g * t;
  }
  return sum;
}

export function statusFromDiffPercent(diffPercent: number): CalorieStatus {
  if (diffPercent >= -5 && diffPercent <= 5) return "balanced";
  if (diffPercent > 5 && diffPercent <= 15) return "slightly_high";
  if (diffPercent > 15) return "high";
  if (diffPercent < -5 && diffPercent >= -15) return "slightly_low";
  return "low";
}

export function calculateCatCalories(
  input: CalculatorInput,
  refDate: Date = new Date(),
): CalculatorOutput {
  const { birthDate, genderOption, weightKg, bodyType, activityLevel, foods } =
    input;

  if (!Number.isFinite(weightKg) || weightKg <= 0) {
    return { ok: false, error: "체중(kg)이 올바르지 않습니다." };
  }

  const ageMonths = ageInCompletedMonths(birthDate, refDate);
  if (Number.isNaN(ageMonths)) {
    return { ok: false, error: "생년월일 형식이 올바르지 않습니다." };
  }

  const rer = rerFromWeightKg(weightKg);
  const baseFactor = baseFactorFor(ageMonths, genderOption);
  const bodyFactor = bodyFactorFor(bodyType);
  const activityFactor = activityFactorFor(activityLevel);

  const recommendedCalories =
    rer * baseFactor * bodyFactor * activityFactor;

  if (!Number.isFinite(recommendedCalories) || recommendedCalories <= 0) {
    return { ok: false, error: "권장 칼로리를 계산할 수 없습니다." };
  }

  const foodCalories = foodCaloriesFromFoods(foods);
  const snackPct = snackPercentOfRecommended(input.snackFrequency);
  const snackCalories = recommendedCalories * (snackPct / 100);
  const totalCalories = foodCalories + snackCalories;
  const diffPercent =
    ((totalCalories - recommendedCalories) / recommendedCalories) * 100;

  return {
    ok: true,
    rer,
    baseFactor,
    bodyFactor,
    activityFactor,
    recommendedCalories,
    foodCalories,
    snackCalories,
    totalCalories,
    diffPercent,
    status: statusFromDiffPercent(diffPercent),
    ageMonths,
  };
}

// --- UI(한글) → 계산기 타입 (Step1~3 연동용) ---

const GENDER_STEP1_TO_OPTION: Record<string, GenderOption> = {
  남: "male_intact",
  "남(중성화)": "male_neutered",
  여: "female_intact",
  "여(중성화)": "female_neutered",
};

export function genderOptionFromStep1Label(
  label: string | null,
): GenderOption | null {
  if (!label) return null;
  return GENDER_STEP1_TO_OPTION[label] ?? null;
}

const BCS_TO_BODY: Record<string, BodyType> = {
  "매우 마름": "very_thin",
  마름: "thin",
  정상: "normal",
  과체중: "overweight",
  비만: "obese",
};

export function bodyTypeFromStep2Bcs(bcs: string): BodyType | null {
  return BCS_TO_BODY[bcs] ?? null;
}

const ACTIVITY_TO_LEVEL: Record<string, ActivityLevel> = {
  낮음: "low",
  보통: "normal",
  높음: "high",
};

export function activityLevelFromStep2Label(
  title: string,
): ActivityLevel | null {
  return ACTIVITY_TO_LEVEL[title] ?? null;
}

const SNACK_LABEL_TO_FREQ: Record<string, SnackFrequency> = {
  "하루 한번": "daily",
  "주 2-3회": "weekly_2_3",
  "주1회 미만": "weekly_less_than_1",
};

export function snackFrequencyFromStep3(
  snack: string | null,
): SnackFrequency {
  if (!snack) return "none";
  return SNACK_LABEL_TO_FREQ[snack] ?? "none";
}

/**
 * Step3 칩 문자열 `…/10g/2회` 에서 g·회·이름 앞부분 추출.
 * 이름에 `/`가 있으면 마지막 두 세그먼트만 g/회로 간주합니다.
 */
export function parseChipFoodLine(text: string): {
  namePart: string;
  amountG: number;
  timesPerDay: number;
} | null {
  const trimmed = text.trim();
  const m = trimmed.match(/^(.+)\/([\d.]+)g\/([\d.]+)회$/);
  if (!m) return null;
  const amountG = Number.parseFloat(m[2]);
  const timesPerDay = Number.parseFloat(m[3]);
  if (!Number.isFinite(amountG) || !Number.isFinite(timesPerDay)) return null;
  if (amountG < 0 || timesPerDay < 0) return null;
  return { namePart: m[1].trim(), amountG, timesPerDay };
}

export function parseWeightKg(weightStr: string): number | null {
  const t = weightStr.trim().replace(",", ".");
  if (!t) return null;
  const n = Number.parseFloat(t);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}
