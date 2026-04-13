import type { CalculatorSuccess } from "@/lib/calculator";

const BASE = "/figma/home";

/**
 * 계산 결과 상태별 일러스트 (@3x 528×657 → 표시 약 176×219)
 * - great_meal: 균형·만족
 * - hungry: 섭취 부족
 * - full: 권장보다 많은 편(그릇이 차 있음)
 */
export const RESULT_HERO_IMAGE: Record<CalculatorSuccess["status"], string> = {
  balanced: `${BASE}/Img_Cat_great_meal.webp`,
  slightly_high: `${BASE}/Img_Cat_full.webp`,
  high: `${BASE}/Img_Cat_full.webp`,
  slightly_low: `${BASE}/Img_Cat_hungry.webp`,
  low: `${BASE}/Img_Cat_hungry.webp`,
};
