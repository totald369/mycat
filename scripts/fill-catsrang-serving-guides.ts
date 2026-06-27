/**
 * 캐츠랑 건식 브랜드 급여 가이드 → cat_food.csv `guide_daily_g` / `guide_weight_kg` 채우기
 *
 * 근거: 고양이대통령(catpre) 캐츠랑 전연령 5kg 권장급여(종이컵 80g 기준)
 * - 활동적 성묘 3–5kg: 70–100g/일 → 4kg 기준 85g
 * - 노령·비활동 3–5kg: 55–80g/일 → 4kg 기준 68g
 * - 6개월 이하 키튼 3–5kg: 90–120g/일 → 2kg 기준 105g
 * - 체중관리·라이트: 60g (저칼로리)
 * - 리브레(310 kcal): 360 kcal 대비 비율 환산 99g
 */
import {
  loadCatFoodCsv,
  writeCatFoodCsv,
  type CsvFeedRow,
} from "./lib/feedServingGuideCsv.ts";
import { defaultGuideWeightKg } from "./lib/feedServingGuideParse.ts";

type GuideRule = {
  match: (row: CsvFeedRow) => boolean;
  dailyG: number;
  weightKg?: number;
};

const RULES: GuideRule[] = [
  {
    match: (r) =>
      r.lifeStage === "kitten_0_12m" ||
      r.name.includes("키튼"),
    dailyG: 105,
    weightKg: 2,
  },
  {
    match: (r) =>
      r.condition === "weight" ||
      r.name.includes("체중관리") ||
      r.name.includes("라이트") ||
      r.name.includes("웨이트케어"),
    dailyG: 60,
  },
  {
    match: (r) =>
      r.lifeStage === "adult_indoor" ||
      r.lifeStage === "senior_7y_plus" ||
      r.name.includes("인도어") ||
      r.name.includes("시니어"),
    dailyG: 68,
  },
  {
    match: (r) => r.name.includes("리브레"),
    dailyG: 99,
  },
  {
    match: () => true,
    dailyG: 85,
  },
];

function pickGuide(row: CsvFeedRow): { dailyG: number; weightKg: number } {
  const rule = RULES.find((r) => r.match(row))!;
  const weightKg =
    rule.weightKg ?? defaultGuideWeightKg(row.lifeStage || null);
  return { dailyG: rule.dailyG, weightKg };
}

function main() {
  const rows = loadCatFoodCsv();
  let updated = 0;

  for (const row of rows) {
    if (row.brand !== "캐츠랑" || row.type !== "dry") continue;
    if (row.guideDailyG.trim() !== "" && row.guideWeightKg.trim() !== "") {
      continue;
    }

    const { dailyG, weightKg } = pickGuide(row);
    row.guideDailyG = String(dailyG);
    row.guideWeightKg = String(weightKg);
    updated++;
    console.log(`${row.id} ${row.name}: ${weightKg}kg → ${dailyG}g/일`);
  }

  if (updated === 0) {
    console.log("업데이트할 캐츠랑 건식 항목 없음");
    return;
  }

  writeCatFoodCsv(rows);
  console.log(`\n캐츠랑 건식 ${updated}건 guide 반영 완료`);
}

main();
