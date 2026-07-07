/**
 * purinapetcare.co.kr 고양이(c1_idx=2) — 미등록 탐지 + cat_food.csv 추가 (건식·습식)
 * 공식몰 봇 차단 시 정적 카탈로그(purina-kr-catalog.json) + Naver pd_idx 매핑 사용
 * Usage: node scripts/register-purina-kr-missing.mjs [--dry-run]
 */
import { readFileSync, writeFileSync, appendFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const DRY = process.argv.includes("--dry-run");
const CSV_PATH = join(process.cwd(), "prisma", "cat_food.csv");
const CATALOG_PATH = join(process.cwd(), "scripts", "purina-kr-catalog.json");
const OUT_JSON = join(process.cwd(), "scripts", "purina-kr-register-result.json");

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept-Language": "ko-KR,ko;q=0.9",
  Referer: "https://www.purinapetcare.co.kr/",
};

/** 기등록 id·pd_idx·정규화명 별칭 */
const EXISTING_ALIASES = {
  "36": ["키튼", "kitten", "1021"],
  "37": ["어덜트", "adult", "chicken rice"],
  "38": ["인도어", "oneindoor", "1018"],
  "39": ["체중관리", "weight", "healthy weight", "1019"],
  "40": ["팬시피스트 치킨", "클래식 닭고기", "classic chicken"],
  "41": ["팬시피스트 참치", "클래식 참치", "classic tuna"],
  "42": ["팬시피스트 파테", "클래식 연어", "classic salmon"],
  "43": ["프리스키 파테", "파테 닭고기", "pate chicken"],
  "44": ["프리스키 슈레드", "쉬레드", "shred salmon"],
  "148": ["키튼 파우치", "kitten pouch"],
  "GP251134930": ["팬시피스트 키튼", "키튼 흰살", "kitten whitefish"],
  "GI251136381": ["키튼 스타터"],
  "GI251136382": ["키튼 1.5"],
};

function normKey(s) {
  return String(s ?? "")
    .toLowerCase()
    .replace(/퓨리나|프로플랜|원\s*캣|purina\s*one|pro\s*plan/gi, "")
    .replace(/\d+(?:\.\d+)?\s*(?:kg|g)/g, "")
    .replace(/[\s_\-/·•+,()&]+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

function parseCsvPurina() {
  const raw = readFileSync(CSV_PATH, "utf8");
  const ids = new Set();
  const keys = new Set();
  for (const line of raw.split(/\r?\n/)) {
    if (!line.includes("퓨리나")) continue;
    const id = line.split(",")[0];
    const name = line.match(/^[^,]+,[^,]+,([^,]+),/)?.[1] ?? "";
    ids.add(id);
    keys.add(normKey(name));
    for (const alias of EXISTING_ALIASES[id] ?? []) {
      keys.add(normKey(alias));
    }
  }
  return { ids, keys };
}

function isRegistered(spec, { ids, keys }) {
  if (ids.has(spec.id)) return true;
  if (spec.pd_idx && ids.has(`PN-KR-${spec.pd_idx}`)) return true;
  const nk = normKey(spec.name);
  if (keys.has(nk)) return true;
  for (const alias of spec.aliases ?? []) {
    if (keys.has(normKey(alias))) return true;
  }
  return false;
}

function csvEscape(s) {
  if (s == null || s === "") return "";
  if (/[",\n]/.test(s)) return `"${String(s).replace(/"/g, '""')}"`;
  return String(s);
}

function makeRow(spec) {
  const cols = [
    spec.id,
    "퓨리나",
    spec.name,
    spec.type,
    spec.life_stage,
    spec.kcal_per_100g ?? "",
    spec.serving_g ?? "",
    spec.guide_daily_g ?? "",
    spec.guide_weight_kg ?? "",
    spec.category,
    spec.condition,
    spec.ingredients ?? "",
    spec.nutrition_analysis ?? "",
  ];
  return cols.map(csvEscape).join(",");
}

async function fetchProductHtml(pdIdx) {
  try {
    const res = await fetch(
      `https://www.purinapetcare.co.kr/shop/product_view.php?pd_idx=${pdIdx}`,
      { headers },
    );
    if (!res.ok) return null;
    const html = await res.text();
    if (html.length < 5000 || /unavailable|Access Denied/i.test(html)) return null;
    return html;
  } catch {
    return null;
  }
}

function parseNutritionFromHtml(html) {
  const out = { kcalPer100g: null, ingredients: "", nutrition: "" };
  const kcalKg = html.match(/(\d{3,4})\s*kcal\s*\/\s*kg/i);
  if (kcalKg) out.kcalPer100g = Math.round(Number(kcalKg[1]) / 10);

  const ingM = html.match(/원재료[^<]*<[^>]+>([^<]{30,800})/i);
  if (ingM) out.ingredients = ingM[1].replace(/\s+/g, " ").trim();

  const parts = [];
  for (const label of ["조단백", "조지방", "조섬유", "수분", "칼슘", "인"]) {
    const m = html.match(new RegExp(`${label}[^\\d]{0,20}([\\d.]+)\\s*%`, "i"));
    if (m) parts.push(`${label.replace("조", "")} ${m[1]}%`);
  }
  if (kcalKg) parts.push(`ME ${kcalKg[1]} kcal/kg`);
  out.nutrition = parts.join(", ");
  return out;
}

async function main() {
  if (!existsSync(CATALOG_PATH)) {
    throw new Error(`Missing ${CATALOG_PATH}`);
  }
  const catalog = JSON.parse(readFileSync(CATALOG_PATH, "utf8"));
  const csvState = parseCsvPurina();

  const missing = catalog.filter((spec) => !isRegistered(spec, csvState));
  console.error(`Catalog: ${catalog.length}, missing: ${missing.length}`);

  const rows = [];
  const added = [];

  for (const spec of missing) {
    let scraped = {};
    if (spec.pd_idx) {
      await new Promise((r) => setTimeout(r, 300));
      const html = await fetchProductHtml(spec.pd_idx);
      if (html) scraped = parseNutritionFromHtml(html);
    }

    const kcal = scraped.kcalPer100g ?? spec.kcal_per_100g;
    const ingredients = scraped.ingredients || spec.ingredients || "";
    const nutrition = scraped.nutrition || spec.nutrition_analysis || "";

    if (!kcal && !nutrition) {
      console.error("SKIP no nutrition", spec.id, spec.name);
      continue;
    }

    const rowSpec = {
      ...spec,
      kcal_per_100g: kcal,
      ingredients,
      nutrition_analysis: nutrition,
    };
    rows.push(makeRow(rowSpec));
    added.push({ id: spec.id, pd_idx: spec.pd_idx, name: spec.name });
    console.error("ADD", spec.id, spec.name);
  }

  writeFileSync(
    OUT_JSON,
    JSON.stringify({ catalog: catalog.length, added, rows }, null, 2),
    "utf8",
  );
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
