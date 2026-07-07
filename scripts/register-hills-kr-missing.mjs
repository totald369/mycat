/**
 * hillspet.co.kr/cat-food 고양이 제품 — 미등록 탐지 + 스크래핑 + cat_food.csv 추가
 * Usage: node scripts/register-hills-kr-missing.mjs [--dry-run]
 */
import { readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";

const DRY = process.argv.includes("--dry-run");
const CSV_PATH = join(process.cwd(), "prisma", "cat_food.csv");
const OUT_JSON = join(process.cwd(), "scripts", "hills-kr-register-result.json");

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "ko-KR,ko;q=0.9",
};

/** slug → 기등록 CSV id (별칭·레거시·HP SKU) */
const SLUG_TO_EXISTING = {
  "prescription-diet-ad-urgent-care-canned": ["71", "HP-WET-AD"],
  "prescription-diet-cd-multicare-chicken-urinary-care-dry": ["65", "HP1500-CD-UR"],
  "prescription-diet-cd-multicare-metabolic-urinary-care-dry": ["HP2880-CD-META"],
  "prescription-diet-cd-multicare-stress-chicken-urinary-care-dry": ["HP1500-CD-STRESS"],
  "prescription-diet-cd-multicare-stress-chicken-vegetable-stew-urinary-care-canned": [
    "HP-WET-CD-STRESS-STEW",
  ],
  "prescription-diet-cd-multicare-stress-vegetable-tuna-stew-urinary-care-canned": [
    "HP-WET-CD-STRESS-TUNA",
  ],
  "prescription-diet-gastrointestinal-biome-stress-digestive-care-dry": ["HP1810-GI-STRESS"],
  "prescription-diet-gastrointestinal-biome-stress-stew-digestive-care-canned": [
    "HP-WET-GI-STRESS-STEW",
  ],
  "prescription-diet-id-chicken-vegetable-stew-digestive-care-canned": ["HP-WET-ID-STEW"],
  "prescription-diet-id-digestive-care-canned": ["64", "HP-WET-ID-PATE"],
  "prescription-diet-id-digestive-care-dry": ["63", "HP1810-ID-DIG"],
  "prescription-diet-kd-chicken-kidney-care-canned": ["62", "HP-WET-KD-PATE"],
  "prescription-diet-kd-chicken-vegetable-stew-kidney-care-canned": ["HP-WET-KD-STEW"],
  "prescription-diet-kd-kidney-care-dry": ["61", "HP1810-KD-CHK"],
  "prescription-diet-kd-ocean-fish-tuna-kidney-care-dry": ["HP1810-KD-FISH"],
  "prescription-diet-kd-ocean-fish-kidney-care-dry": ["HP1810-KD-FISH"],
  "prescription-diet-metabolic-weight-management-dry": ["HP1500-META"],
  "prescription-diet-onc-on-care-chicken-stew-restorative-care-canned": ["HP-WET-ONC-STEW"],
  "prescription-diet-td-dental-care-dry": ["70", "HP1500-TD"],
  "prescription-diet-wd-chicken-glucose-management-canned": ["HP-WET-WD"],
  "prescription-diet-wd-glucose-management-dry": ["69", "HP1500-WD"],
  "prescription-diet-yd-thyroid-care-dry": ["HP1810-YD"],
  "prescription-diet-zd-food-sensitivities-canned": ["68", "HP-WET-ZD"],
  "prescription-diet-zd-food-sensitivities-dry": ["67", "HP1810-ZD"],
  "science-diet-adult-hairball-dry": ["16", "HP1584-ADT-HB"],
  "science-diet-adult-hairball-light-dry": ["HP1584-ADT-HB-LGT"],
  "science-diet-adult-indoor-dry": ["15", "HP1584-ADT-IND"],
  "science-diet-adult-light-dry": ["HP2000-ADT-LGT"],
  "science-diet-adult-original-dry": ["12", "HP2000-ADT-CHK"],
  "science-diet-adult-perfect-digestion-chicken-barley-whole-oats-recipe-dry": [
    "HP1584-ADT-PD",
  ],
  "science-diet-adult-perfect-digestion-chicken-vegetable-rice-stew-canned": [
    "HP-WET-PD-STEW",
  ],
  "science-diet-adult-perfect-digestion-salmon-oats-rice-dry": ["HP1584-ADT-PD-SAL"],
  "science-diet-adult-perfect-weight-dry": ["14", "HP6800-ADT-PW"],
  "science-diet-adult-perfect-weight-vegetable-chicken-stew-canned": ["HP-WET-PW-STEW"],
  "science-diet-adult-urinary-hairball-control-dry": ["HP1584-ADT-UR-HB"],
  "science-diet-kitten-original-dry": ["11", "HP1584-KTN-ORG"],
  "science-diet-kitten-sensitive-stomach-skin-salmon-brown-rice-dry": [
    "HP1584-KTN-SENS-SAL",
  ],
  "science-diet-mature-adult-7-healthy-cuisine-chicken-rice-med-stew-canned": [
    "HP-WET-SNR7-STEW",
  ],
  "science-diet-mature-adult-7-perfect-digestion-dry": ["HP1584-SNR7-PD"],
  "science-diet-mature-adult-hairball-dry": ["HP1584-SNR7-HB"],
  "science-diet-mature-adult-indoor-dry": ["13", "HP1584-SNR7-IND"],
  "science-diet-senior-11-dry": ["HP1584-SNR11-CHK"],
};

/** 신규 등록 대상 (slug → 메타) */
const NEW_PRODUCTS = {
  "prescription-diet-id-kitten-chicken-pate-digestive-care-canned": {
    id: "HP-WET-ID-KTN",
    name: "i/d 키튼 반려묘용 습식사료(치킨 파테) 156g",
    type: "wet",
    life_stage: "kitten_0_12m",
    category: "prescription",
    condition: "digestive",
    serving_g: 156,
  },
  "prescription-diet-kd-early-stage-support-chicken-kidney-care-dry": {
    id: "HP1810-KD-EARLY",
    name: "k/d 얼리 서포트 반려묘용 건사료(치킨) 1.81kg",
    type: "dry",
    life_stage: "adult_1y_plus",
    category: "prescription",
    condition: "kidney",
    guide_daily_g: 50,
    guide_weight_kg: 4,
  },
  "prescription-diet-kd-vegetable-tuna-stew-kidney-care-canned": {
    id: "HP-WET-KD-TUNA",
    name: "k/d 반려묘용 습식사료(야채&튜나 스튜) 82g",
    type: "wet",
    life_stage: "adult_1y_plus",
    category: "prescription",
    condition: "kidney",
    serving_g: 82,
  },
  "prescription-diet-onc-on-care-chicken-restorative-care-dry": {
    id: "HP1500-ONC",
    name: "ONC 케어 반려묘용 건사료(치킨) 1.5kg",
    type: "dry",
    life_stage: "adult_1y_plus",
    category: "prescription",
    condition: "cancer",
    guide_daily_g: 55,
    guide_weight_kg: 4,
  },
  "science-diet-adult-healthy-cuisine-chicken-rice-medley-stew-canned": {
    id: "HP-WET-HC-ADT-CHK",
    name: "어덜트 헬시 퀴진 치킨 & 쌀 스튜 79g",
    type: "wet",
    life_stage: "adult_1_7y",
    category: "general",
    condition: "none",
    serving_g: 79,
  },
  "science-diet-adult-healthy-cuisine-tuna-carrot-medley-stew-canned": {
    id: "HP-WET-HC-ADT-TUNA",
    name: "어덜트 헬시 퀴진 참치&당근 스튜 79g",
    type: "wet",
    life_stage: "adult_1_7y",
    category: "general",
    condition: "none",
    serving_g: 79,
  },
  "science-diet-adult-salmon-brown-rice-dry": {
    id: "HP1584-ADT-SAL-BR",
    name: "어덜트 연어 & 현미 레시피 1.58kg",
    type: "dry",
    life_stage: "adult_1_7y",
    category: "general",
    condition: "none",
    guide_daily_g: 60,
    guide_weight_kg: 4,
  },
  "science-diet-adult-urinary-hairball-control-canned": {
    id: "HP-WET-UR-HB",
    name: "어덜트 유리너리 헤어볼 컨트롤 82g",
    type: "wet",
    life_stage: "adult_1_7y",
    category: "general",
    condition: "urinary",
    serving_g: 82,
  },
  "science-diet-kitten-healthy-cuisine-chicken-rice-medley-stew-canned": {
    id: "HP-WET-HC-KTN-CHK",
    name: "키튼 헬시 퀴진 치킨 & 쌀 스튜 79g",
    type: "wet",
    life_stage: "kitten_0_12m",
    category: "general",
    condition: "none",
    serving_g: 79,
  },
};

function normKey(s) {
  return String(s ?? "")
    .toLowerCase()
    .replace(/&amp;/g, "&")
    .replace(/힐스|프리스크립션\s*다이어트|사이언스\s*다이어트|반려묘용|건사료|건식사료|습식사료|레시피|플레이버|\d+(?:\.\d+)?\s*kg|\d+g/g, "")
    .replace(/[\s_\-/·•+,()&]+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

function parseCsvHills() {
  const raw = readFileSync(CSV_PATH, "utf8");
  const ids = new Set();
  const keys = new Set();
  for (const line of raw.split(/\r?\n/)) {
    if (!line.includes("힐스")) continue;
    const id = line.split(",")[0];
    const name = line.match(/^[^,]+,[^,]+,([^,]+),/)?.[1] ?? "";
    ids.add(id);
    keys.add(normKey(name));
  }
  return { ids, keys };
}

function isRegistered(slug, title, { ids, keys }) {
  const mapped = SLUG_TO_EXISTING[slug];
  if (mapped?.some((id) => ids.has(id))) return true;
  if (NEW_PRODUCTS[slug] && ids.has(NEW_PRODUCTS[slug].id)) return true;
  const tk = normKey(title);
  if (keys.has(tk)) return true;
  return false;
}

async function fetchHtml(url, retries = 4) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      if (html.length > 1000) return html;
    } catch (e) {
      if (i === retries - 1) return null;
      await new Promise((r) => setTimeout(r, 800 * (i + 1)));
    }
  }
  return null;
}

function stripTags(s) {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function parseProduct(html, slug) {
  let title = "";
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) title = stripTags(h1[1]);

  let form = "dry";
  if (/습식|캔|파테|스튜|canned|stew/i.test(title)) form = "wet";
  const formBlock = html.match(/사료\s*형태[\s\S]{0,200}?(건사료|습식|캔|스튜)/i);
  if (formBlock) form = /건/.test(formBlock[1]) ? "dry" : "wet";

  const BAD_ING = /급여|유용한정보|주치의|반려동물을/;
  function cleanIngredientText(raw) {
    return raw.replace(/<[^>]+>/g, "").replace(/\s+/g, "").trim();
  }
  function isIngredientList(s) {
    if (!s.includes(",") || s.length < 30 || BAD_ING.test(s)) return false;
    if (/구매하신|반려동물을|함께하는|사이언스다이어트구매/.test(s)) return false;
    return /닭|물|돼지|쌀|옥수수|현미|생선|연어|참치|정제수|Salmon|Chicken|BrownRice/.test(s);
  }

  let ingredients = "";
  const candidates = [];
  for (const m of html.matchAll(
    /cmp-accordion__title">([^<]*성분[^<]*)<[\s\S]*?<div class="segment[^"]*">\s*([\s\S]*?)\s*<\/div>/g,
  )) {
    candidates.push(cleanIngredientText(m[2]));
  }
  for (const seg of html.matchAll(/<div class="segment[^"]*">\s*([\s\S]*?)\s*<\/div>/g)) {
    candidates.push(cleanIngredientText(seg[1]));
  }
  for (const s of candidates) {
    if (!isIngredientList(s)) continue;
    if (/^(Salmon|Chicken|물|닭)/.test(s)) {
      ingredients = s;
      break;
    }
    if (!ingredients) ingredients = s;
  }

  let kcalKg = null;
  let kcalCan = null;
  let servingG = null;
  const kcalKgM = html.match(/(\d{3,4})\s*kcal\/kg/i);
  if (kcalKgM) kcalKg = Number(kcalKgM[1]);
  const kcalCanM = html.match(
    /(\d{2,4}(?:\.\d+)?)\s*kcal\s*\/[^(\n<]*\(\s*(\d+)\s*g\s*\)/i,
  );
  if (kcalCanM) {
    kcalCan = Number(kcalCanM[1]);
    servingG = Number(kcalCanM[2]);
  }

  const nutrients = {};
  for (const label of ["단백질", "지방", "조섬유", "칼슘", "인", "마그네슘", "타우린"]) {
    const m = html.match(
      new RegExp(`<td>\\s*${label}\\s*</td>\\s*<td>\\s*([\\d.]+)\\s*%`, "i"),
    );
    if (m) nutrients[label] = m[1] + "%";
  }
  const parts = [];
  for (const label of ["단백질", "지방", "조섬유", "칼슘", "인", "마그네슘", "타우린"]) {
    if (nutrients[label]) parts.push(`${label} ${nutrients[label]}`);
  }
  if (kcalKg) parts.push(`ME ${kcalKg} kcal/kg (건조물 기준)`);

  let kcalPer100g = null;
  if (kcalKg) kcalPer100g = Math.round(kcalKg / 10);
  else if (kcalCan && servingG) kcalPer100g = Math.round((kcalCan / servingG) * 100);

  return { slug, title, form, ingredients, kcalPer100g, servingG, nutrition: parts.join(", ") };
}

function csvEscape(s) {
  if (s == null || s === "") return "";
  if (/[",\n]/.test(s)) return `"${String(s).replace(/"/g, '""')}"`;
  return String(s);
}

function makeRow(spec, scraped) {
  const serving = spec.serving_g ?? scraped.servingG ?? "";
  const kcal = scraped.kcalPer100g ?? "";
  const cols = [
    spec.id,
    "힐스",
    spec.name,
    spec.type,
    spec.life_stage,
    kcal,
    serving,
    spec.guide_daily_g ?? "",
    spec.guide_weight_kg ?? "",
    spec.category,
    spec.condition,
    scraped.ingredients ?? "",
    scraped.nutrition ?? "",
  ];
  return cols.map(csvEscape).join(",");
}

async function discoverSlugs() {
  const html = await fetchHtml("https://www.hillspet.co.kr/cat-food");
  if (!html) throw new Error("listing fetch failed");
  return [...new Set([...html.matchAll(/cat-food\/([a-z0-9\-]+)/g)].map((m) => m[1]))].sort();
}

async function main() {
  const csvState = parseCsvHills();
  const slugs = await discoverSlugs();
  console.error(`KR listing: ${slugs.length} slugs`);

  const missing = [];
  for (const slug of slugs) {
    if (SLUG_TO_EXISTING[slug]?.some((id) => csvState.ids.has(id))) continue;
    if (NEW_PRODUCTS[slug] && csvState.ids.has(NEW_PRODUCTS[slug].id)) continue;

    await new Promise((r) => setTimeout(r, 250));
    const url = `https://www.hillspet.co.kr/cat-food/${slug}`;
    const html = await fetchHtml(url);
    if (!html) {
      console.error("FAIL fetch", slug);
      continue;
    }
    const scraped = parseProduct(html, slug);
    if (isRegistered(slug, scraped.title, csvState)) continue;
    if (!NEW_PRODUCTS[slug]) {
      console.error("UNMAPPED missing", slug, scraped.title);
      continue;
    }
    missing.push({ slug, spec: NEW_PRODUCTS[slug], scraped });
  }

  console.error(`Missing to add: ${missing.length}`);
  const rows = [];
  for (const { slug, spec, scraped } of missing) {
    if (!scraped.kcalPer100g && !scraped.nutrition) {
      console.error("SKIP no nutrition", spec.id, slug);
      continue;
    }
    const row = makeRow(spec, scraped);
    rows.push(row);
    console.error("ADD", spec.id, spec.name);
  }

  const result = {
    scanned: slugs.length,
    missing: missing.map((m) => ({ slug: m.slug, id: m.spec.id, title: m.spec.name })),
    rows,
  };
  writeFileSync(OUT_JSON, JSON.stringify(result, null, 2), "utf8");
  console.error(`Wrote ${OUT_JSON}`);

  if (rows.length === 0) {
    console.error("No new rows");
    return;
  }
  if (DRY) {
    console.log(rows.join("\n"));
    return;
  }
  appendFileSync(CSV_PATH, rows.join("\n") + "\n", "utf8");
  console.error(`Appended ${rows.length} rows to cat_food.csv`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
