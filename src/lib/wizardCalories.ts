import {
  activityLevelFromStep2Label,
  bodyTypeFromStep2Bcs,
  calculateCatCalories,
  genderOptionFromStep1Label,
  parseChipFoodLine,
  parseWeightKg,
  snackFrequencyFromStep3,
  type CalculatorInput,
  type CalculatorOutput,
  type CalculatorSuccess,
  type FoodInput,
} from "@/lib/calculator";
import type { Step3ChipPersist } from "@/lib/wizardStorage";
import { readWizardState } from "@/lib/wizardStorage";

export type FeedCatalogItem = {
  id: string;
  apiId: string;
  label: string;
  displayLabel: string;
  kcalPer100g: number | null;
  feedKind?: string;
  servingGrams?: number | null;
};

export function findKcalPer100gForFeedLabel(
  namePart: string,
  items: FeedCatalogItem[],
): number | null {
  const t = namePart.trim();
  if (!t) return null;
  const byLabel = items.find((i) => i.label === t);
  if (
    byLabel?.kcalPer100g != null &&
    Number.isFinite(byLabel.kcalPer100g)
  ) {
    return byLabel.kcalPer100g;
  }
  const byDisp = items.find((i) => i.displayLabel === t);
  if (
    byDisp?.kcalPer100g != null &&
    Number.isFinite(byDisp.kcalPer100g)
  ) {
    return byDisp.kcalPer100g;
  }
  return null;
}

export function buildFoodsFromWizardChips(
  chipTexts: string[],
  items: FeedCatalogItem[],
): { foods: FoodInput[]; unmatched: string[] } {
  const foods: FoodInput[] = [];
  const unmatched: string[] = [];

  for (const text of chipTexts) {
    const parsed = parseChipFoodLine(text);
    if (!parsed) {
      unmatched.push(text);
      continue;
    }
    const kcal = findKcalPer100gForFeedLabel(parsed.namePart, items);
    if (kcal == null) {
      unmatched.push(parsed.namePart);
      continue;
    }
    foods.push({
      kcalPer100g: kcal,
      amountG: parsed.amountG,
      timesPerDay: parsed.timesPerDay,
    });
  }

  return { foods, unmatched };
}

export type ValidateWizardBeforeResultOptions = {
  /** Step3 화면의 최신 칩(로컬 state). 생략 시 저장소의 step3만 사용 */
  chips?: Step3ChipPersist[];
  snack?: string | null;
};

/**
 * 결과 화면 이동 전 최소 검증 (Step1~2 필수값 + 급여 칩 1개 이상 + 칩 문자열 형식).
 */
export function validateWizardBeforeResult(
  options?: ValidateWizardBeforeResultOptions,
): { ok: true } | { ok: false; error: string } {
  const w = readWizardState();
  const chips =
    options?.chips !== undefined ? options.chips : w.step3.chips;

  if (!w.step1.name.trim()) {
    return { ok: false, error: "Step1에서 이름을 입력해 주세요." };
  }

  if (!w.step1.birthDate.trim()) {
    return { ok: false, error: "Step1에서 생년월일을 입력해 주세요." };
  }

  if (!genderOptionFromStep1Label(w.step1.gender)) {
    return {
      ok: false,
      error: "Step1에서 성별 및 중성화 여부를 선택해 주세요.",
    };
  }

  if (w.step1.weightUnknown) {
    return {
      ok: false,
      error: "Step1에서 체중을 입력하거나 「정확히 모름」을 해제해 주세요.",
    };
  }

  if (parseWeightKg(w.step1.weight) == null) {
    return {
      ok: false,
      error: "Step1에서 현재 체중(kg)을 올바르게 입력해 주세요.",
    };
  }

  if (!bodyTypeFromStep2Bcs(w.step2.bcs)) {
    return {
      ok: false,
      error: "Step2에서 체형(BCS)을 선택해 주세요.",
    };
  }

  if (!activityLevelFromStep2Label(w.step2.activity)) {
    return {
      ok: false,
      error: "Step2에서 활동량을 선택해 주세요.",
    };
  }

  if (chips.length < 1) {
    return {
      ok: false,
      error: "급여 사료를 한 가지 이상 추가해 주세요.",
    };
  }

  for (const c of chips) {
    if (!parseChipFoodLine(c.text)) {
      return {
        ok: false,
        error:
          "급여 항목 형식을 확인해 주세요. (사료명/그램g/횟수회, 예: 로얄캐닌/10g/1회)",
      };
    }
  }

  return { ok: true };
}

export type WizardCalorieCompute = {
  output: CalculatorOutput;
  warnings: string[];
};

export function computeCaloriesWithWizard(
  catalog: FeedCatalogItem[],
): WizardCalorieCompute {
  const warnings: string[] = [];
  const w = readWizardState();

  if (!w.step1.birthDate.trim()) {
    return {
      output: { ok: false, error: "생년월일을 입력해 주세요." },
      warnings,
    };
  }

  const gender = genderOptionFromStep1Label(w.step1.gender);
  if (!gender) {
    return {
      output: { ok: false, error: "성별 및 중성화 여부를 선택해 주세요." },
      warnings,
    };
  }

  if (w.step1.weightUnknown) {
    return {
      output: {
        ok: false,
        error: "체중을 알 수 없으면 칼로리를 계산할 수 없습니다.",
      },
      warnings,
    };
  }

  const weightKg = parseWeightKg(w.step1.weight);
  if (weightKg == null) {
    return {
      output: { ok: false, error: "현재 체중(kg)을 올바르게 입력해 주세요." },
      warnings,
    };
  }

  const bodyType = bodyTypeFromStep2Bcs(w.step2.bcs);
  if (!bodyType) {
    return {
      output: { ok: false, error: "체형(BCS) 정보를 확인해 주세요." },
      warnings,
    };
  }

  const activityLevel = activityLevelFromStep2Label(w.step2.activity);
  if (!activityLevel) {
    return {
      output: { ok: false, error: "활동량 정보를 확인해 주세요." },
      warnings,
    };
  }

  const chipTexts = w.step3.chips.map((c) => c.text);
  const { foods, unmatched } = buildFoodsFromWizardChips(chipTexts, catalog);
  if (unmatched.length > 0) {
    warnings.push(
      `칼로리(DB)를 찾지 못했거나 형식이 다른 급여: ${unmatched.slice(0, 5).join(", ")}${unmatched.length > 5 ? " …" : ""}`,
    );
  }

  const snackFrequency = snackFrequencyFromStep3(w.step3.snack);

  const input: CalculatorInput = {
    birthDate: w.step1.birthDate.trim(),
    genderOption: gender,
    weightKg,
    bodyType,
    activityLevel,
    foods,
    snackFrequency,
  };

  const output = calculateCatCalories(input);
  return { output, warnings };
}

export function formatKcal(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return `${Math.round(n)}kcal`;
}

/** 피그마 계산결과: 이모지 포함 한 줄 타이틀 */
const STATUS_HEADLINE: Record<CalculatorSuccess["status"], string> = {
  balanced: "균형잡힌 식사❤️",
  slightly_high: "배불러요 🤮",
  high: "배불러요 🤮",
  slightly_low: "배고파요.. 😭",
  low: "배고파요.. 😭",
};

/** 부가 설명(필요 시) — 결과 화면 부제와 동일 메시지 */
const STATUS_BODY: Record<CalculatorSuccess["status"], string> = {
  balanced:
    "적절한 양의 사료를 먹고 있어요! 지금 급여량을 유지해주세요.",
  slightly_high:
    "많은 양의 사료를 먹고 있어요! 급여량을 줄여주세요.",
  high: "많은 양의 사료를 먹고 있어요! 급여량을 줄여주세요.",
  slightly_low:
    "적은 양의 사료를 먹고 있어요! 급여량을 늘려주세요.",
  low: "적은 양의 사료를 먹고 있어요! 급여량을 늘려주세요.",
};

export function statusHeadline(status: CalculatorSuccess["status"]): string {
  return STATUS_HEADLINE[status];
}

export function statusBodyText(status: CalculatorSuccess["status"]): string {
  return STATUS_BODY[status];
}
