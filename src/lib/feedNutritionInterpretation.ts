export type NutritionMetric = {
  label: string;
  value: number;
  unit: "%";
};

export type NutritionInterpretation = {
  metric: NutritionMetric;
  interpretation: string;
};

const PROTEIN_RE =
  /(?:조)?단백(?:질)?\s*([0-9]+(?:\.[0-9]+)?)\s*%|단백질\s*([0-9]+(?:\.[0-9]+)?)\s*%/i;
const FAT_RE =
  /(?:조)?지방\s*([0-9]+(?:\.[0-9]+)?)\s*%|지방\s*([0-9]+(?:\.[0-9]+)?)\s*%/i;
const FIBER_RE = /조섬유\s*([0-9]+(?:\.[0-9]+)?)\s*%/i;
const MOISTURE_RE = /수분\s*([0-9]+(?:\.[0-9]+)?)\s*%/i;

function firstMatch(re: RegExp, text: string): number | null {
  const m = text.match(re);
  if (!m) return null;
  const val = m[1] ?? m[2];
  if (!val) return null;
  const n = Number.parseFloat(val);
  return Number.isFinite(n) ? n : null;
}

export function parseNutritionMetrics(
  nutritionAnalysis: string | null | undefined,
): NutritionMetric[] {
  if (!nutritionAnalysis?.trim()) return [];
  const text = nutritionAnalysis;
  const metrics: NutritionMetric[] = [];

  const protein = firstMatch(PROTEIN_RE, text);
  if (protein != null) metrics.push({ label: "조단백", value: protein, unit: "%" });

  const fat = firstMatch(FAT_RE, text);
  if (fat != null) metrics.push({ label: "조지방", value: fat, unit: "%" });

  const fiber = firstMatch(FIBER_RE, text);
  if (fiber != null) metrics.push({ label: "조섬유", value: fiber, unit: "%" });

  const moisture = firstMatch(MOISTURE_RE, text);
  if (moisture != null) metrics.push({ label: "수분", value: moisture, unit: "%" });

  return metrics;
}

function interpretProtein(value: number, isWet: boolean): string {
  if (isWet) {
    if (value >= 11)
      return "습식 기준으로 단백질 함량이 높은 편입니다. 성장기·활동량이 많은 고양이 급여에 참고할 수 있어요.";
    if (value >= 8)
      return "습식 사료에서 흔한 단백질 수준입니다. 하루 총 칼로리와 다른 끼니와 함께 맞춰 급여하세요.";
    return "습식 기준으로 단백질이 낮은 편일 수 있어요. 주식으로 쓸 때는 다른 끼니와 영양 균형을 확인하세요.";
  }
  if (value >= 38)
    return "건식 기준으로 단백질 함량이 매우 높은 편입니다. 성장기·활동량이 많은 고양이에게 적합할 수 있어요.";
  if (value >= 32)
    return "건식 기준으로 단백질 함량이 높은 편입니다. 성장기 고양이나 근육 유지가 필요한 경우에 적합할 수 있어요.";
  if (value >= 26)
    return "건식에서 일반적인 단백질 수준입니다. 체중·활동량에 맞춰 급여량을 조절하세요.";
  return "건식 기준으로 단백질이 낮은 편일 수 있어요. 연령·건강 상태에 맞는지 확인하세요.";
}

function interpretFat(value: number, isWet: boolean): string {
  if (isWet) {
    if (value >= 5)
      return "습식 기준으로 지방 함량이 높은 편입니다. 칼로리가 높을 수 있어 급여량 계산에 반영하세요.";
    if (value >= 2)
      return "습식에서 흔한 지방 수준입니다. 체중 관리가 필요하면 하루 총 칼로리를 함께 확인하세요.";
    return "습식 기준으로 지방이 낮은 편입니다. 저칼로리 습식으로 활용할 수 있어요.";
  }
  if (value >= 22)
    return "건식 기준으로 지방 함량이 높은 편입니다. 활동량이 적은 고양이는 급여량 조절이 필요할 수 있어요.";
  if (value >= 15)
    return "건식에서 일반적인 지방 수준입니다. 체중·활동량에 따라 급여량을 조절하세요.";
  if (value >= 10)
    return "건식 기준으로 지방이 낮은 편입니다. 체중 관리·저지방 식단에 참고할 수 있어요.";
  return "건식 기준으로 지방이 매우 낮은 편입니다. 에너지 밀도가 낮을 수 있어 총 급여량을 확인하세요.";
}

function interpretFiber(value: number, isWet: boolean): string {
  if (isWet) {
    if (value >= 1.5)
      return "습식 기준으로 섬유질이 높은 편입니다. 장 건강·헤어볼 관리에 도움이 될 수 있어요.";
    return "습식에서 흔한 섬유질 수준입니다.";
  }
  if (value >= 6)
    return "건식 기준으로 섬유질이 매우 높은 편입니다. 포만감·체중 관리·헤어볼에 도움이 될 수 있어요.";
  if (value >= 4)
    return "건식 기준으로 섬유질이 높은 편입니다. 실내·체중 관리 사료에서 자주 볼 수 있는 수준이에요.";
  if (value >= 2)
    return "건식에서 일반적인 섬유질 수준입니다.";
  return "건식 기준으로 섬유질이 낮은 편입니다.";
}

function interpretMoisture(value: number): string {
  if (value >= 80)
    return "수분 함량이 매우 높아 습식·파우치·캔 사료에 해당하는 수준입니다. 수분 섭취 보조에 유리해요.";
  if (value >= 10)
    return "수분 함량이 중간 수준입니다. 건습 혼합 급여 시 수분 보충을 함께 고려하세요.";
  return "수분 함량이 낮아 건식 사료에 해당하는 수준입니다. 음수량·습식 비율을 함께 확인하세요.";
}

export function buildNutritionInterpretations(
  nutritionAnalysis: string | null | undefined,
  isWet: boolean,
): NutritionInterpretation[] {
  const metrics = parseNutritionMetrics(nutritionAnalysis);
  return metrics.map((metric) => {
    let interpretation: string;
    switch (metric.label) {
      case "조단백":
        interpretation = interpretProtein(metric.value, isWet);
        break;
      case "조지방":
        interpretation = interpretFat(metric.value, isWet);
        break;
      case "조섬유":
        interpretation = interpretFiber(metric.value, isWet);
        break;
      case "수분":
        interpretation = interpretMoisture(metric.value);
        break;
      default:
        interpretation = "성분 수치는 급여량 계산과 함께 참고하세요.";
    }
    return { metric, interpretation };
  });
}
