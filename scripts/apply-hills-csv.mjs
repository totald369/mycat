/**
 * hills-scraped.json + 수동 SKU → prisma/cat_food.csv append
 * Usage: node scripts/apply-hills-csv.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const scraped = JSON.parse(
  readFileSync(join(process.cwd(), "scripts", "hills-scraped.json"), "utf8"),
);
const bySlug = Object.fromEntries(scraped.map((p) => [p.slug, p]));

/** slug → { id, name?, serving_g?, kcal_per_100g? } — name/kcal은 공식값 우선, 없으면 스크래핑 */
const PRODUCTS = [
  {
    slug: "pd-gastrointestinal-biome-feline-dry",
    id: "HP1810-GI-BIOME",
    name: "GI 바이옴 반려묘용 건사료 1.81kg",
    type: "dry",
    life_stage: "adult_1y_plus",
    category: "prescription",
    condition: "digestive",
  },
  {
    slug: "science-diet-adult-original-dry",
    id: "HP2000-ADT-CHK",
    name: "어덜트 치킨 레시피 2kg",
    type: "dry",
    life_stage: "adult_1_7y",
    category: "general",
    condition: "none",
  },
  {
    slug: "science-diet-adult-hairball-dry",
    id: "HP1584-ADT-HB",
    name: "어덜트 헤어볼 컨트롤 치킨 레시피 1.58kg",
    type: "dry",
    life_stage: "adult_1_7y",
    category: "general",
    condition: "hairball",
  },
  {
    slug: "science-diet-adult-hairball-light-dry",
    id: "HP1584-ADT-HB-LGT",
    name: "어덜트 헤어볼 컨트롤 라이트 치킨 레시피 1.58kg",
    type: "dry",
    life_stage: "adult_1_7y",
    category: "general",
    condition: "weight",
  },
  {
    slug: "science-diet-adult-perfect-digestion-salmon-oats-brown-rice-dry",
    id: "HP1584-ADT-PD-SAL",
    name: "어덜트 퍼펙트 다이제스천 연어 1.58kg",
    type: "dry",
    life_stage: "adult_1_7y",
    category: "general",
    condition: "digestive",
    fetch: true,
  },
  {
    slug: "pd-kd-feline-dry",
    id: "HP1810-KD-CHK",
    name: "k/d 반려묘용 건사료(치킨) 1.81kg",
    type: "dry",
    life_stage: "adult_1y_plus",
    category: "prescription",
    condition: "kidney",
  },
  {
    slug: "prescription-diet-kd-ocean-fish-tuna-kidney-care-dry",
    id: "HP1810-KD-FISH",
    name: "k/d 반려묘용 건식사료(오션피쉬) 1.81kg",
    type: "dry",
    life_stage: "adult_1y_plus",
    category: "prescription",
    condition: "kidney",
  },
  {
    slug: "pd-metabolic-feline-dry",
    id: "HP1500-META",
    name: "메타볼릭 반려묘용 건사료(치킨) 1.5kg",
    type: "dry",
    life_stage: "adult_1y_plus",
    category: "prescription",
    condition: "weight",
  },
  {
    slug: "pd-td-feline-dry",
    id: "HP1500-TD",
    name: "t/d 반려묘용 건사료(치킨) 1.5kg",
    type: "dry",
    life_stage: "adult_1y_plus",
    category: "prescription",
    condition: "dental",
  },
  {
    slug: "pd-wd-feline-dry",
    id: "HP1500-WD",
    name: "w/d 멀티베네핏 반려묘용 건사료(치킨) 1.5kg",
    type: "dry",
    life_stage: "adult_1y_plus",
    category: "prescription",
    condition: "weight",
  },
  {
    slug: "pd-yd-feline-dry",
    id: "HP1810-YD",
    name: "y/d 반려묘용 건사료(치킨) 1.81kg",
    type: "dry",
    life_stage: "adult_1y_plus",
    category: "prescription",
    condition: "thyroid",
  },
  {
    slug: "pd-zd-feline-dry",
    id: "HP1810-ZD",
    name: "z/d 반려묘용 건사료 1.81kg",
    type: "dry",
    life_stage: "adult_1y_plus",
    category: "prescription",
    condition: "allergy",
  },
  {
    slug: "pd-id-feline-canned",
    id: "HP-WET-ID-PATE",
    name: "i/d 반려묘용 습식사료(치킨 파테) 156g",
    type: "wet",
    life_stage: "all_life_stage",
    category: "prescription",
    condition: "digestive",
    serving_g: 156,
  },
  {
    slug: "pd-id-feline-chicken-and-vegetable-stew-canned",
    id: "HP-WET-ID-STEW",
    name: "i/d 치킨&채소 스튜 반려묘용 습식사료 82g",
    type: "wet",
    life_stage: "all_life_stage",
    category: "prescription",
    condition: "digestive",
    serving_g: 82,
  },
  {
    slug: "pd-wd-feline-canned",
    id: "HP-WET-WD",
    name: "w/d 멀티 베네핏 반려묘용 습식사료(치킨) 156g",
    type: "wet",
    life_stage: "adult_1y_plus",
    category: "prescription",
    condition: "weight",
    serving_g: 156,
  },
  {
    slug: "pd-zd-feline-canned",
    id: "HP-WET-ZD",
    name: "z/d 하이드롤라이즈드 치킨 반려묘용 습식사료 156g",
    type: "wet",
    life_stage: "adult_1y_plus",
    category: "prescription",
    condition: "allergy",
    serving_g: 156,
  },
  {
    slug: "pd-ad-canine-feline-canned",
    id: "HP-WET-AD",
    name: "a/d 반려묘용 습식사료(치킨) 156g",
    type: "wet",
    life_stage: "all_life_stage",
    category: "prescription",
    condition: "recovery",
    serving_g: 156,
    kcal_per_100g: 120,
  },
  {
    slug: "prescription-diet-kd-chicken-kidney-care-canned",
    id: "HP-WET-KD-PATE",
    name: "k/d 파테 위드 치킨 반려묘용 습식사료 156g",
    type: "wet",
    life_stage: "adult_1y_plus",
    category: "prescription",
    condition: "kidney",
    serving_g: 156,
    kcal_per_100g: 95,
  },
  {
    slug: "prescription-diet-kd-chicken-vegetable-stew-kidney-care-canned",
    id: "HP-WET-KD-STEW",
    name: "k/d 반려묘용 습식사료(치킨&야채 스튜) 82g",
    type: "wet",
    life_stage: "adult_1y_plus",
    category: "prescription",
    condition: "kidney",
    serving_g: 82,
    kcal_per_100g: 95,
  },
  {
    slug: "prescription-diet-cd-multicare-stress-chicken-vegetable-stew-urinary-care-canned",
    id: "HP-WET-CD-STRESS-STEW",
    name: "c/d 멀티케어 스트레스 습식사료(치킨&야채 스튜) 82g",
    type: "wet",
    life_stage: "adult_1y_plus",
    category: "prescription",
    condition: "urinary",
    serving_g: 82,
    kcal_per_100g: 85,
  },
  {
    slug: "prescription-diet-cd-multicare-stress-vegetable-tuna-stew-urinary-care-canned",
    id: "HP-WET-CD-STRESS-TUNA",
    name: "c/d 멀티케어 스트레스 습식사료(채소&참치 스튜) 82g",
    type: "wet",
    life_stage: "adult_1y_plus",
    category: "prescription",
    condition: "urinary",
    serving_g: 82,
    kcal_per_100g: 85,
  },
  {
    slug: "pd-gastrointestinal-biome-feline-chicken-and-vegetable-stew-canned",
    id: "HP-WET-GI-STEW",
    name: "GI 바이옴 치킨&채소 스튜 반려묘용 습식사료 82g",
    type: "wet",
    life_stage: "adult_1y_plus",
    category: "prescription",
    condition: "digestive",
    serving_g: 82,
    kcal_per_100g: 89,
  },
  {
    slug: "prescription-diet-gastrointestinal-biome-stress-stew-digestive-care-canned",
    id: "HP-WET-GI-STRESS-STEW",
    name: "GI 바이옴 스트레스 습식사료 82g",
    type: "wet",
    life_stage: "adult_1y_plus",
    category: "prescription",
    condition: "digestive",
    serving_g: 82,
    kcal_per_100g: 89,
  },
  {
    slug: "pd-feline-onc-on-care-chicken-stew",
    id: "HP-WET-ONC-STEW",
    name: "ONC 케어 반려묘용 습식사료 82g",
    type: "wet",
    life_stage: "adult_1y_plus",
    category: "prescription",
    condition: "cancer",
    serving_g: 82,
    kcal_per_100g: 120,
  },
  {
    slug: "science-diet-adult-perfect-digestion-chicken-vegetable-rice-stew-canned",
    id: "HP-WET-PD-STEW",
    name: "어덜트 퍼펙트 다이제스천 치킨·채소 & 쌀 스튜 82g",
    type: "wet",
    life_stage: "adult_1_7y",
    category: "general",
    condition: "digestive",
    serving_g: 82,
  },
  {
    slug: "sd-feline-adult-7-plus-healthy-cuisine-roasted-chicken-rice-medley-canned",
    id: "HP-WET-SNR7-STEW",
    name: "어덜트 7+ 헬시 퀴진 로스티드 치킨&쌀 메들리 79g",
    type: "wet",
    life_stage: "senior_7y_plus",
    category: "general",
    condition: "none",
    serving_g: 79,
  },
];

async function fetchProduct(slug) {
  const url = `https://www.hillspet.co.kr/cat-food/${slug}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept-Language": "ko-KR,ko;q=0.9",
    },
  });
  if (!res.ok) return null;
  const html = await res.text();
  const ingM = html.match(
    /cmp-accordion__title">성분<[\s\S]*?<div class="segment[^"]*">\s*([\s\S]*?)\s*<\/div>/,
  );
  const ingredients = ingM
    ? ingM[1].replace(/<[^>]+>/g, "").replace(/\s+/g, "").trim()
    : "";
  const kcalKgM = html.match(/(\d{3,4})\s*kcal\/kg/i);
  const kcalCanM = html.match(
    /(\d{2,4}(?:\.\d+)?)\s*kcal\s*\/[^(\n<]*\(\s*(\d+)\s*g\s*\)/i,
  );
  let kcalPer100g = null;
  let servingG = null;
  if (kcalKgM) kcalPer100g = Math.round(Number(kcalKgM[1]) / 10);
  if (kcalCanM) {
    servingG = Number(kcalCanM[2]);
    kcalPer100g = Math.round((Number(kcalCanM[1]) / servingG) * 100);
  }
  const nutrients = {};
  for (const label of [
    "단백질",
    "지방",
    "조섬유",
    "칼슘",
    "인",
    "마그네슘",
    "타우린",
  ]) {
    const m = html.match(
      new RegExp(`<td>\\s*${label}\\s*</td>\\s*<td>\\s*([\\d.]+)\\s*%`, "i"),
    );
    if (m) nutrients[label] = m[1] + "%";
  }
  const parts = [];
  for (const label of [
    "단백질",
    "지방",
    "조섬유",
    "칼슘",
    "인",
    "마그네슘",
    "타우린",
  ]) {
    if (nutrients[label]) parts.push(`${label} ${nutrients[label]}`);
  }
  if (kcalKgM) parts.push(`ME ${kcalKgM[1]} kcal/kg (건조물 기준)`);
  return {
    ingredients: ingredients.includes(",") ? ingredients : "",
    kcalPer100g,
    servingG,
    nutrition: parts.join(", "),
  };
}

function csvEscape(s) {
  if (s == null || s === "") return "";
  if (/[",\n]/.test(s)) return `"${String(s).replace(/"/g, '""')}"`;
  return String(s);
}

const csvPath = join(process.cwd(), "prisma", "cat_food.csv");
const existing = readFileSync(csvPath, "utf8");
const existingIds = new Set(
  existing
    .split("\n")
    .slice(1)
    .map((l) => l.split(",")[0])
    .filter(Boolean),
);

const rows = [];
for (const spec of PRODUCTS) {
  if (existingIds.has(spec.id)) continue;
  let p = bySlug[spec.slug];
  if (!p && spec.fetch) p = await fetchProduct(spec.slug);
  if (!p && spec.slug === "pd-gastrointestinal-biome-feline-dry")
    p = await fetchProduct(spec.slug);
  if (!p) p = bySlug[spec.slug] ?? (await fetchProduct(spec.slug));
  if (!p) {
    console.error("MISSING", spec.slug);
    continue;
  }

  const data =
    typeof p.ingredients === "string"
      ? p
      : {
          ingredients: p?.ingredients ?? "",
          kcalPer100g: p?.kcalPer100g,
          servingG: p?.servingG,
          nutrition: p?.nutrition ?? "",
        };

  const kcal =
    spec.kcal_per_100g ?? data.kcalPer100g ?? p?.kcalPer100g ?? "";
  const serving = spec.serving_g ?? data.servingG ?? p?.servingG ?? "";
  const ing = data.ingredients || p?.ingredients || "";
  const nut = data.nutrition || p?.nutrition || "";

  if (!kcal && !nut) {
    console.error("SKIP no data", spec.id);
    continue;
  }

  rows.push(
    [
      spec.id,
      "힐스",
      spec.name,
      spec.type,
      spec.life_stage,
      kcal,
      serving,
      spec.category,
      spec.condition,
      ing,
      nut,
    ]
      .map(csvEscape)
      .join(","),
  );
  console.error("ADD", spec.id, spec.name);
}

if (rows.length === 0) {
  console.error("No new rows");
  process.exit(0);
}

writeFileSync(csvPath, existing.trimEnd() + "\n" + rows.join("\n") + "\n", "utf8");
console.error(`Appended ${rows.length} rows to cat_food.csv`);
