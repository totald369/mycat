/**
 * 아미오 건식 브랜드 급여 가이드 → cat_food.csv `guide_daily_g` / `guide_weight_kg` 채우기
 *
 * 근거: 풀무원몰(shop.pulmuone.co.kr) 상품 메타·포장 권장급여 `serving_g` 값.
 * 건식 UI는 `guide_daily_g`를 사용하므로 serving_g → guide_daily_g 이전.
 * 체중케어(175) 등 일부 SKU는 PM 용량별 serving_g 표기 차이 → 동일 레시피 원본 id 기준 복사.
 */
import {
  loadCatFoodCsv,
  writeCatFoodCsv,
  type CsvFeedRow,
} from "./lib/feedServingGuideCsv.ts";
import { defaultGuideWeightKg } from "./lib/feedServingGuideParse.ts";

const MIN_DAILY_GRAMS = 15;
const MAX_DAILY_GRAMS = 250;

/** PM SKU → 동일 레시피 원본 id (serving_g·guide 우선) */
const RECIPE_SOURCE_ID: Record<string, string> = {
  PM38361: "173",
  PM38367: "174",
  PM38705: "175",
  PM38704: "PM39252",
  PM38703: "PM39250",
};

function parseServingG(value: string): number | null {
  const n = Number.parseFloat(value.trim());
  if (!Number.isFinite(n)) return null;
  if (n < MIN_DAILY_GRAMS || n > MAX_DAILY_GRAMS) return null;
  return Math.round(n);
}

function isWeightLine(row: CsvFeedRow): boolean {
  return row.condition === "weight" || /체중|슬림|날씬/.test(row.name);
}

function pickGuide(row: CsvFeedRow, byId: Map<string, CsvFeedRow>): {
  dailyG: number;
  weightKg: number;
} | null {
  const sourceId = RECIPE_SOURCE_ID[row.id];
  const source = sourceId ? byId.get(sourceId) : null;

  if (isWeightLine(row)) {
    const lifeStage = source?.lifeStage || row.lifeStage;
    return { dailyG: 60, weightKg: defaultGuideWeightKg(lifeStage || null) };
  }

  const candidates = [
    source?.guideDailyG,
    row.guideDailyG,
    source?.servingG,
    row.servingG,
  ];

  let dailyG: number | null = null;
  for (const raw of candidates) {
    if (!raw?.trim()) continue;
    dailyG = parseServingG(raw);
    if (dailyG != null) break;
  }

  if (dailyG == null) {
    if (row.lifeStage === "kitten_0_12m" || row.name.includes("키튼")) {
      dailyG = 60;
    } else {
      dailyG = 55;
    }
  }

  const lifeStage = source?.lifeStage || row.lifeStage;
  const weightKg = defaultGuideWeightKg(lifeStage || null);

  return { dailyG, weightKg };
}

function main() {
  const rows = loadCatFoodCsv();
  const byId = new Map(rows.map((r) => [r.id, r]));
  let updated = 0;

  for (const row of rows) {
    if (row.brand !== "아미오" || row.type !== "dry") continue;
    if (row.guideDailyG.trim() !== "" && row.guideWeightKg.trim() !== "") {
      continue;
    }

    const picked = pickGuide(row, byId);
    if (!picked) continue;

    row.guideDailyG = String(picked.dailyG);
    row.guideWeightKg = String(picked.weightKg);
    updated++;
    console.log(`${row.id} ${row.name}: ${picked.weightKg}kg → ${picked.dailyG}g/일`);
  }

  if (updated === 0) {
    console.log("업데이트할 아미오 건식 항목 없음");
    return;
  }

  writeCatFoodCsv(rows);
  console.log(`\n아미오 건식 ${updated}건 guide 반영 완료`);
}

main();
