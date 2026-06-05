/**
 * hills-scraped.json → 신규 CSV 행 생성
 * Usage: node scripts/hills-to-csv.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const scraped = JSON.parse(
  readFileSync(join(process.cwd(), "scripts", "hills-scraped.json"), "utf8"),
);

const csvText = readFileSync(join(process.cwd(), "prisma", "cat_food.csv"), "utf8");
const existingIds = new Set();
const existingHpSlugs = new Set();
for (const line of csvText.split("\n")) {
  if (!line.startsWith("HP")) continue;
  const id = line.split(",")[0];
  existingIds.add(id);
}

/** 이미 등록된 공식 페이지 슬러그 (별칭 포함) */
const REGISTERED_SLUGS = new Set([
  "science-diet-kitten-sensitive-stomach-skin-salmon-brown-rice-dry",
  "science-diet-adult-urinary-hairball-control-dry",
  "sd-feline-adult-urinary-hairball-control-dry",
  "science-diet-mature-adult-hairball-dry",
  "sd-feline-adult-7-plus-hairball-control-dry",
  "science-diet-mature-adult-7-perfect-digestion-dry",
  "science-diet-mature-adult-indoor-dry",
  "sd-feline-adult-indoor-dry",
  "prescription-diet-cd-multicare-stress-chicken-urinary-care-dry",
  "prescription-diet-gastrointestinal-biome-stress-digestive-care-dry",
  "prescription-diet-cd-multicare-chicken-urinary-care-dry",
  "prescription-diet-id-digestive-care-dry",
  "pd-id-feline-dry",
  "science-diet-adult-indoor-dry",
  "sd-feline-adult-indoor-dry",
  "prescription-diet-cd-multicare-metabolic-urinary-care-dry",
  "science-diet-senior-11-dry",
  "science-diet-adult-light-dry",
  "science-diet-kitten-original-dry",
  "science-diet-adult-perfect-weight-dry",
  "science-diet-adult-perfect-digestion-chicken-barley-whole-oats-recipe-dry",
]);

const SLUG_ALIASES = {
  "sd-feline-adult-indoor-dry": "science-diet-adult-indoor-dry",
  "sd-feline-adult-urinary-hairball-control-dry":
    "science-diet-adult-urinary-hairball-control-dry",
  "sd-feline-adult-7-plus-hairball-control-dry":
    "science-diet-mature-adult-hairball-dry",
  "sd-feline-adult-hairball-control-light-dry":
    "science-diet-adult-hairball-light-dry",
  "prescription-diet-id-digestive-care-dry": "pd-id-feline-dry",
  "prescription-diet-id-digestive-care-canned": "pd-id-feline-canned",
  "prescription-diet-kd-kidney-care-dry": "pd-kd-feline-dry",
  "prescription-diet-td-dental-care-dry": "pd-td-feline-dry",
  "prescription-diet-wd-glucose-management-dry": "pd-wd-feline-dry",
  "prescription-diet-zd-food-sensitivities-dry": "pd-zd-feline-dry",
  "prescription-diet-yd-thyroid-care-dry": "pd-yd-feline-dry",
  "pd-gastrointestinal-biome-feline-dry":
    "prescription-diet-gastrointestinal-biome-feline-dry",
};

function canonicalSlug(slug) {
  return SLUG_ALIASES[slug] ?? slug;
}

function isRegistered(slug) {
  const c = canonicalSlug(slug);
  return REGISTERED_SLUGS.has(slug) || REGISTERED_SLUGS.has(c);
}

function parseSizeKg(size, slug) {
  if (!size) {
    if (slug.includes("canned") || slug.includes("stew")) return null;
    const m = slug.match(/(\d+)kg/);
    if (m) return Number(m[1]);
    return null;
  }
  const kg = size.match(/([\d.]+)\s*kg/i);
  if (kg) return Number(kg[1]);
  return null;
}

function makeSku(slug, size, form) {
  const kg = parseSizeKg(size, slug);
  const prefix =
    kg != null
      ? `HP${String(Math.round(kg * 1000)).padStart(4, "0")}`
      : form === "wet"
        ? "HP-WET"
        : "HP";

  const parts = slug
    .replace(/^(science-diet-|prescription-diet-|sd-feline-|pd-)/, "")
    .split("-")
    .filter((p) => !["dry", "canned", "feline", "recipe", "care"].includes(p))
    .slice(0, 4)
    .map((p) => p.slice(0, 4).toUpperCase())
    .join("-");
  let sku = `${prefix}-${parts}`.replace(/--+/g, "-").slice(0, 28);
  let n = 1;
  const base = sku;
  while (existingIds.has(sku)) {
    sku = `${base}-${n++}`;
  }
  existingIds.add(sku);
  return sku;
}

function inferMeta(p) {
  const t = (p.title + " " + p.slug).toLowerCase();
  let category = p.isPrescription ? "prescription" : "general";
  let condition = "none";
  let lifeStage = "adult_1_7y";

  if (/kitten|키튼|ktn/.test(t)) lifeStage = "kitten_0_12m";
  else if (/7\+|11\+|senior|mature|시니어|7세|11세/.test(t))
    lifeStage = "senior_7y_plus";
  else if (/어덜트\s*1|adult/.test(t) && !/7\+|11\+/.test(t))
    lifeStage = "adult_1_7y";
  else if (/all.life|성장기.*성년기/.test(t)) lifeStage = "all_life_stage";

  if (/indoor|인도어/.test(t)) lifeStage = "adult_indoor";
  if (/k\/d|kidney|신장/.test(t)) condition = "kidney";
  else if (/i\/d|digestive|소화|gi.biome|gastrointestinal/.test(t))
    condition = "digestive";
  else if (/c\/d|urinary|유리너리|비뇨/.test(t)) condition = "urinary";
  else if (/z\/d|sensitiv|민감|food-sensitiv/.test(t)) condition = "allergy";
  else if (/w\/d|weight|체중|light|라이트|metabolic|메타볼릭|perfect-weight|퍼펙트 웨이트/.test(t))
    condition = "weight";
  else if (/t\/d|dental|치아/.test(t)) condition = "dental";
  else if (/y\/d|thyroid|갑상선/.test(t)) condition = "thyroid";
  else if (/a\/d|urgent|회복|recovery/.test(t)) condition = "recovery";
  else if (/hairball|헤어볼/.test(t)) condition = "hairball";
  else if (/onc|암/.test(t)) condition = "cancer";

  if (/prescription|프리스크립션|pd-/.test(t)) category = "prescription";

  return { category, condition, lifeStage };
}

function cleanTitle(title) {
  return title
    .replace(/\s*\|\s*힐스.*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function appendSize(name, size, kg) {
  if (/\d\s*kg|\d+g/.test(name)) return name;
  if (kg) return `${name} ${kg}kg`;
  if (size && /kg|g/.test(size)) {
    const s = size.split(",")[0].trim();
    return `${name} ${s}`;
  }
  return name;
}

function csvEscape(s) {
  if (s == null || s === "") return "";
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const newRows = [];
const seenCanonical = new Set(
  [...REGISTERED_SLUGS].map((s) => canonicalSlug(s)),
);

for (const p of scraped) {
  const canon = canonicalSlug(p.slug);
  if (isRegistered(p.slug) || seenCanonical.has(canon)) continue;
  if (!p.kcalPer100g && !p.nutrition) continue;

  // 스튜/캔 중 kcal 없는 항목 스킵 (공식 페이지 미표기)
  if (p.form === "wet" && !p.kcalPer100g) continue;

  seenCanonical.add(canon);

  const kg = parseSizeKg(p.size, p.slug);
  const meta = inferMeta(p);
  const sku = makeSku(p.slug, p.size, p.form);
  const name = appendSize(cleanTitle(p.title), p.size, kg);

  newRows.push({
    id: sku,
    brand: "힐스",
    name,
    type: p.form === "wet" ? "wet" : "dry",
    life_stage: meta.lifeStage,
    kcal_per_100g: p.kcalPer100g ?? "",
    serving_g: p.servingG ?? "",
    category: meta.category,
    condition: meta.condition,
    ingredients: p.ingredients ?? "",
    nutrition_analysis: p.nutrition ?? "",
    slug: p.slug,
    url: p.url,
  });
}

const lines = newRows.map((r) =>
  [
    r.id,
    r.brand,
    r.name,
    r.type,
    r.life_stage,
    r.kcal_per_100g,
    r.serving_g,
    r.category,
    r.condition,
    r.ingredients,
    r.nutrition_analysis,
  ]
    .map(csvEscape)
    .join(","),
);

const outPath = join(process.cwd(), "scripts", "hills-new-rows.csv");
writeFileSync(outPath, lines.join("\n") + "\n", "utf8");
console.error(`New rows: ${newRows.length} → ${outPath}`);
for (const r of newRows) {
  console.log(`${r.id}\t${r.name.slice(0, 50)}\t${r.kcal_per_100g}\t${r.slug}`);
}
