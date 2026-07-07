/**
 * mongekorea.co.kr 고양이 사료 — 미등록 탐지 + cat_food.csv 추가
 * KR 공식몰은 성분 미표기 → monge.shop 글로벌 페이지로 영양·원재료 보완
 * Usage:
 *   node scripts/register-monge-kr-missing.mjs [--dry-run]
 *   node scripts/register-monge-kr-missing.mjs --refresh [--dry-run]
 */
import { readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";

const DRY = process.argv.includes("--dry-run");
const REFRESH = process.argv.includes("--refresh");
const CSV_PATH = join(process.cwd(), "prisma", "cat_food.csv");
const CATALOG_PATH = join(process.cwd(), "scripts", "monge-kr-catalog.json");
const OUT_JSON = join(process.cwd(), "scripts", "monge-kr-register-result.json");

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept-Language": "ko-KR,ko;q=0.9",
};

const CATEGORY_PAGES = [
  "https://www.mongekorea.co.kr/monge-cat",
  "https://www.mongekorea.co.kr/bwild-cat",
  "https://www.mongekorea.co.kr/42",
  "https://www.mongekorea.co.kr/40",
];

/** KR idx → monge.shop 글로벌 성분 페이지 */
const GLOBAL_URL_BY_IDX = {
  214: "https://monge.shop/pl/monoprotein/92-cat-adult-krolik-15kg.html",
  215: "https://monge.shop/pl/monoprotein/75-kitten-pstrag-15kg.html",
  216: "https://monge.shop/gb/monoprotein/498-cat-sterilized-duck-10kg-8009470056182.html",
  217: "https://monge.shop/pl/monoprotein/89-cat-sterilised-pstrag-15kg.html",
  241: "https://monge.shop/gb/vet-solution/140-vetsolution-cat-dermatosis-15kg.html",
  242: "https://monge.shop/gb/vet-solution/141-vetsolution-cat-diabetic-400g.html",
  243: "https://monge.shop/gb/vet-solution/145-vetsolution-cat-gastrointestinal-400g.html",
  244: "https://monge.shop/gb/vet-solution/153-vetsolution-cat-hepatic-15kg.html",
  245: "https://monge.shop/gb/vet-solution/155-vetsolution-cat-obesity-400g.html",
  246: "https://monge.shop/gb/vet-solution/143-vetsolution-cat-renal-400g.html",
  247: "https://monge.shop/gb/vet-solution/151-vetsolution-cat-urinary-oxalate-15kg.html",
  248: "https://monge.shop/gb/vet-solution/149-vetsolution-cat-urinary-struvite-400g.html",
  249: "https://monge.shop/gb/vet-solution/181-monge-vetsolution-cat-dermatosis-100g.html",
  250: "https://monge.shop/gb/vet-solution/145-vetsolution-cat-gastrointestinal-400g.html",
  251: "https://monge.shop/gb/vet-solution/180-monge-vetsolution-cat-recovery-100g.html",
  252: "https://monge.shop/gb/vet-solution/466-monge-vetsolution-cat-renal-and-oxalate-100g.html",
  253: "https://monge.shop/gb/vet-solution/178-monge-vetsolution-cat-urinary-struvite-100g.html",
  258: "https://monge.shop/pl/monge-bwild/kot/karma-sucha/521-cat-bwild-grain-free-dorsz-z-ziemniakami-i-soczewica-15kg-8009470012058.html",
  261: "https://monge.shop/pl/monge-bwild/kot/karma-sucha/542-cat-bwild-grain-free-losos-15kg-8009470012072.html",
  262: "https://monge.shop/pl/monge-bwild/kot/karma-sucha/522-cat-bwild-grain-free-sterilised-tunczyk-z-groszkiem-15kg-8009470012089.html",
  318: "https://monge.shop/pl/monoprotein/49-monoprotein-z-miesem-krolika-80g.html",
  319: "https://monge.shop/pl/monge-bwild/kot/karma-mokra/585-bwild-grain-free-tunczyk-z-krewetkami-i-warzywami-w-sosie-85g.html",
  320: "https://monge.shop/pl/monge-bwild/kot/karma-mokra/586-bwild-grain-free-losos-z-krewetkami-i-warzywami-w-sosie-85g.html",
  321: "https://monge.shop/pl/monge-bwild/kot/karma-mokra/587-bwild-grain-free-dorsz-z-krewetkami-i-warzywami-w-sosie-85g.html",
  322: "https://monge.shop/pl/monge-bwild/kot/karma-mokra/589-bwild-grain-free-anchois-z-warzywami-w-sosie-85g.html",
  323: "https://monge.shop/pl/monge-bwild/kot/karma-mokra/588-bwild-grain-free-dzik-z-warzywami-w-sosie-85g.html",
  324: "https://monge.shop/pl/monge-bwild/kot/karma-mokra/538-bwild-grain-free-pasztet-z-tunczykiem-100g-8009470012898.html",
  325: "https://monge.shop/pl/monge-bwild/kot/karma-mokra/536-bwild-grain-free-pasztet-z-lososiem-100g-8009470012881.html",
  326: "https://monge.shop/pl/monge-bwild/kot/karma-mokra/535-bwild-grain-free-pasztet-z-dorszem-100g-8009470012867.html",
  327: "https://monge.shop/pl/monge-bwild/kot/karma-mokra/537-bwild-grain-free-pasztet-z-anchois-100g-8009470012874.html",
  328: "https://monge.shop/pl/monge-bwild/kot/karma-mokra/539-bwild-grain-free-pasztet-z-dzikiem-100g-8009470012904.html",
  364: "https://monge.shop/pl/monoprotein/84-cat-adult-losos-15kg.html",
  367: "https://monge.shop/pl/monoprotein/595-cat-sterilised-dorsz-15kg.html",
  482: "https://monge.shop/pl/monoprotein/672-kitten-kaczka-15kg.html",
};

function decodeHtml(s) {
  return String(s ?? "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\u00a0/g, " ")
    .replace(/\\\//g, "/")
    .replace(/\\n/g, " ")
    .replace(/\\"/g, '"');
}

function normKey(s) {
  return String(s ?? "")
    .toLowerCase()
    .replace(/몬지|monge/gi, "")
    .replace(/\d+(?:\.\d+)?\s*(?:kg|g)/g, "")
    .replace(/[\s_\-/·•+,()&]+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

function csvEscape(s) {
  if (s == null || s === "") return "";
  if (/[",\n]/.test(s)) return `"${String(s).replace(/"/g, '""')}"`;
  return String(s);
}

function makeRow(spec) {
  return [
    spec.id,
    "몬지",
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
  ]
    .map(csvEscape)
    .join(",");
}

function parseCsvRows(raw) {
  const lines = raw.split(/\r?\n/);
  const header = lines[0];
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const cols = [];
    let cur = "";
    let inQ = false;
    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      if (inQ) {
        if (ch === '"' && line[j + 1] === '"') {
          cur += '"';
          j++;
        } else if (ch === '"') inQ = false;
        else cur += ch;
      } else if (ch === '"') inQ = true;
      else if (ch === ",") {
        cols.push(cur);
        cur = "";
      } else cur += ch;
    }
    cols.push(cur);
    rows.push({ raw: line, cols });
  }
  return { header, rows };
}

function parseCsvMonge() {
  const raw = readFileSync(CSV_PATH, "utf8");
  const ids = new Set();
  const keys = new Set();
  for (const line of raw.split(/\r?\n/)) {
    if (!line.includes("몬지")) continue;
    const id = line.split(",")[0];
    const name = line.match(/^[^,]+,[^,]+,([^,]+),/)?.[1] ?? "";
    ids.add(id);
    keys.add(normKey(name));
    const mgId = id.match(/MG-KR-(\d+)/)?.[1];
    if (mgId) ids.add(mgId);
  }
  return { ids, keys };
}

function isRegistered(spec, { ids, keys }) {
  if (ids.has(spec.id)) return true;
  if (ids.has(String(spec.product_id))) return true;
  if (spec.name && keys.has(normKey(spec.name))) return true;
  return false;
}

function decodeProductAttr(s) {
  return decodeHtml(s);
}

function parseProductsFromHtml(html) {
  const out = [];
  for (const m of html.matchAll(/data-product-properties=['"]([^'"]+)['"]/g)) {
    try {
      out.push(JSON.parse(decodeProductAttr(m[1])));
    } catch {
      /* skip */
    }
  }
  return out;
}

function shouldSkipListing(name) {
  if (/\[dog\]|강아지/i.test(name)) return true;
  if (/샘플|sample|기프트|gift/i.test(name)) return true;
  return false;
}

function isCatListing(name) {
  return /\[cat\]|고양이|몬지|벳솔루션|모노프로틴|비와일드|슈프림|스팀쿡/i.test(name);
}

function normalizeKrName(raw) {
  return decodeHtml(raw)
    .replace(/^\[CAT\]\s*/i, "")
    .replace(/^\[고양이\]\s*/i, "")
    .replace(/\s*\/고양이[^/]*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function inferMeta(name) {
  const blob = name;
  const isWet =
    /습식|파우치|캔|그레이비|파테|플레이크|스팀쿡|청키/i.test(blob) ||
    /\b(80|85|100)g\b/i.test(blob);
  const isPrescription = /벳솔루션|처방/i.test(blob);

  let life_stage = "adult_1y_plus";
  if (/키튼/i.test(blob)) life_stage = "kitten_0_12m";
  else if (/시니어|senior|7\+|11\+/i.test(blob)) life_stage = "senior_7y_plus";

  let condition = "none";
  if (/유리너리|urinary/i.test(blob)) condition = "urinary";
  else if (/가스트로|인테스티널|소화|digest/i.test(blob)) condition = "digestive";
  else if (/더마토시스|하이포알러제닉|피부|skin/i.test(blob)) condition = "skin_allergy";
  else if (/오베시티|웨이트|체중|weight/i.test(blob)) condition = "weight";
  else if (/레날|renal/i.test(blob)) condition = "renal";
  else if (/헤파틱|hepatic/i.test(blob)) condition = "digestive";
  else if (/다이아베틱|diabetic/i.test(blob)) condition = "weight";
  else if (/리커버리|recovery/i.test(blob)) condition = "digestive";

  let serving_g = "";
  if (isWet) {
    const g = blob.match(/\b(70|80|85|100)g\b/i);
    serving_g = g ? g[1] : "85";
  }

  return {
    type: isWet ? "wet" : "dry",
    life_stage,
    category: isPrescription ? "prescription" : "general",
    condition,
    serving_g,
  };
}

function parsePct(raw) {
  return String(raw ?? "").replace(",", ".");
}

function parseKcalKg(raw) {
  const s = String(raw ?? "").trim();
  if (/^\d{1,2}[.,]\d{3}$/.test(s)) return Number(s.replace(/[.,]/, ""));
  return Number(s.replace(/,/g, ""));
}

function cleanIngredients(raw) {
  const text = String(raw ?? "")
    .replace(/^[^A-Za-zÀ-ž(]*/, "")
    .replace(/content\s*":\s*"/i, "")
    .replace(/\\"/g, '"')
    .replace(/""description_short""[\s\S]*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
  if (/description_short|available_now|id_product/i.test(text)) return "";
  return text;
}

function extractIngredients(text) {
  const en =
    text.match(
      /COMPOSITION:?\s*([\s\S]{0,1800}?)(?:ANALYTICAL CONSTITUENTS|SKŁADNIKI ANALITYCZNE|ADDITIVES:|DODATKI:|INSTRUCTIONS FOR USE)/i,
    )?.[1] ?? "";
  if (en && /\(\d+%/.test(en)) return en;

  const plSklad =
    text.match(
      /SKŁAD:?\s*([\s\S]{0,1800}?)(?:SKŁADNIKI ANALITYCZNE|ANALITYCZNE:|DODATKI:|INSTRUCTIONS FOR USE)/i,
    )?.[1] ?? "";
  if (plSklad && /\d+%/.test(plSklad)) return plSklad;

  const pl =
    text.match(
      /SKŁADNIKI:?\s*([\s\S]{0,1800}?)(?:SKŁADNIKI ANALITYCZNE|ANALITYCZNE:|DODATKI:|INSTRUCTIONS FOR USE)/i,
    )?.[1] ?? "";
  if (pl && /\(\d+%/.test(pl)) return pl;

  const inline = text.match(
    /(?:COMPOSITION|SKŁADNIKI|SKŁAD):?\s*([A-Za-zÀ-ž(][\s\S]{40,1200}?)(?:ANALYTICAL|SKŁADNIKI ANALITYCZNE|ANALITYCZNE:|ADDITIVES|DODATKI)/i,
  )?.[1];
  return inline ?? (en || plSklad || pl);
}

function parseMongeShopHtml(html) {
  const text = decodeHtml(html)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");

  const comp = extractIngredients(text);

  const analBlock =
    text
      .match(
        /ANALYTICAL CONSTITUENTS:?\s*([\s\S]{0,900}?)(?:ADDITIVES:|INSTRUCTIONS FOR USE|Cat food only)/i,
      )?.[1]
      ?.trim() ??
    text
      .match(/SKŁADNIKI ANALITYCZNE:?\s*([\s\S]{0,900}?)(?:DODATKI:|INSTRUCTIONS FOR USE|Cat food only)/i)?.[1]
      ?.trim() ??
    text.match(/ANALITYCZNE:?\s*([\s\S]{0,900}?)(?:DODATKI:|INSTRUCTIONS FOR USE)/i)?.[1]?.trim() ??
    "";

  let kcalKg = null;
  const km =
    analBlock.match(/([0-9][0-9.,]*)\s*kcal\s*\/\s*kg/i) ??
    analBlock.match(/Metabolizowana energia:?\s*([0-9][0-9.,]*)\s*kcal/i) ??
    text.match(/Metabolisable Energy[^0-9]*([0-9][0-9.,]*)\s*kcal\s*\/\s*kg/i);
  if (km) kcalKg = parseKcalKg(km[1]);

  const parts = [];
  for (const [label, re] of [
    ["단백질", /crude protein[^0-9]*([0-9.,]+)\s*%/i],
    ["지방", /crude fat[^0-9]*([0-9.,]+)\s*%/i],
    ["조섬유", /crude fib(?:er|re)[^0-9]*([0-9.,]+)\s*%/i],
    ["조회분", /crude ash[^0-9]*([0-9.,]+)\s*%/i],
    ["수분", /moisture[^0-9]*([0-9.,]+)\s*%/i],
    ["단백질", /Biało surowe:?\s*([0-9.,]+)\s*%/i],
    ["지방", /Tłuszcz surowy:?\s*([0-9.,]+)\s*%/i],
    ["조섬유", /Włókno surowe:?\s*([0-9.,]+)\s*%/i],
    ["조회분", /Popiół surowy:?\s*([0-9.,]+)\s*%/i],
    ["수분", /Wilgotność:?\s*([0-9.,]+)\s*%/i],
  ]) {
    const m = analBlock.match(re);
    if (m && !parts.some((p) => p.startsWith(label))) {
      parts.push(`${label} ${parsePct(m[1])}%`);
    }
  }

  return {
    ingredients: cleanIngredients(comp),
    kcalKg,
    nutrition_analysis: [parts.join(", "), kcalKg ? `ME ${kcalKg} kcal/kg` : ""]
      .filter(Boolean)
      .join(", "),
  };
}

async function discoverKrProducts() {
  const all = new Map();
  for (const url of CATEGORY_PAGES) {
    const res = await fetch(url, { headers });
    const html = await res.text();
    for (const p of parseProductsFromHtml(html)) {
      if (!p?.idx || !p?.name || shouldSkipListing(p.name)) continue;
      if (!isCatListing(p.name)) continue;
      all.set(p.idx, {
        product_id: p.idx,
        raw_name: p.name,
        kr_url: `https://www.mongekorea.co.kr/shop_view/?idx=${p.idx}`,
        category_url: url,
        price: p.price,
      });
    }
  }
  return [...all.values()].sort((a, b) => a.product_id - b.product_id);
}

async function enrichFromGlobal(idx) {
  const url = GLOBAL_URL_BY_IDX[idx];
  if (!url) return { global_url: "", ingredients: "", nutrition_analysis: "", kcalKg: null };
  const res = await fetch(url, { headers: { ...headers, "Accept-Language": "en-US,en;q=0.9" } });
  if (!res.ok) return { global_url: url, ingredients: "", nutrition_analysis: "", kcalKg: null };
  const parsed = parseMongeShopHtml(await res.text());
  return { global_url: url, ...parsed };
}

async function buildCatalog(discovered) {
  const catalog = [];
  for (const item of discovered) {
    const name = normalizeKrName(item.raw_name);
    const meta = inferMeta(name);
    const global = await enrichFromGlobal(item.product_id);
    catalog.push({
      id: `MG-KR-${item.product_id}`,
      product_id: item.product_id,
      name,
      url: item.kr_url,
      global_url: global.global_url,
      kcal_per_100g: global.kcalKg ? Math.round(global.kcalKg / 10) : "",
      ingredients: global.ingredients,
      nutrition_analysis: global.nutrition_analysis,
      ...meta,
    });
    await new Promise((r) => setTimeout(r, 120));
  }
  return catalog;
}

function refreshCsvRows(catalog) {
  const raw = readFileSync(CSV_PATH, "utf8");
  const { header, rows } = parseCsvRows(raw);
  const byId = new Map(catalog.map((s) => [s.id, s]));
  let updated = 0;
  for (const row of rows) {
    const id = row.cols[0];
    const spec = byId.get(id);
    if (!spec) continue;
    row.cols[2] = spec.name;
    row.cols[3] = spec.type;
    row.cols[4] = spec.life_stage;
    row.cols[5] = String(spec.kcal_per_100g ?? "");
    row.cols[6] = String(spec.serving_g ?? "");
    row.cols[9] = spec.category;
    row.cols[10] = spec.condition;
    row.cols[11] = spec.ingredients ?? "";
    row.cols[12] = spec.nutrition_analysis ?? "";
    row.raw = row.cols.map(csvEscape).join(",");
    updated++;
  }
  if (!DRY && updated) {
    writeFileSync(CSV_PATH, [header, ...rows.map((r) => r.raw)].join("\n") + "\n", "utf8");
  }
  return updated;
}

async function main() {
  console.log("Discovering Monge KR cat products...");
  const discovered = await discoverKrProducts();
  console.log("Discovered:", discovered.length);

  const catalog = await buildCatalog(discovered);
  const withNutrition = catalog.filter((s) => s.ingredients || s.nutrition_analysis || s.kcal_per_100g);
  console.log(`Catalog: ${catalog.length}, with global nutrition: ${withNutrition.length}`);

  if (!DRY) {
    writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2));
    console.log("Wrote", CATALOG_PATH);
  }

  if (REFRESH) {
    const updated = refreshCsvRows(catalog);
    console.log(`Refreshed ${updated} existing rows`);
  } else {
    const index = parseCsvMonge();
    const toAdd = catalog.filter((s) => !isRegistered(s, index));
    console.log(`Missing: ${toAdd.length}`);
    if (!DRY && toAdd.length) {
      appendFileSync(CSV_PATH, toAdd.map(makeRow).join("\n") + "\n", "utf8");
      console.log(`Appended ${toAdd.length} rows to cat_food.csv`);
    } else if (DRY) {
      for (const s of toAdd) console.log("ADD", s.id, s.name);
    } else {
      console.log("No new rows");
    }
  }

  writeFileSync(
    OUT_JSON,
    JSON.stringify(
      {
        discovered: discovered.length,
        catalog: catalog.length,
        with_nutrition: withNutrition.length,
        refreshed: REFRESH,
        at: new Date().toISOString(),
      },
      null,
      2,
    ),
  );
  console.log("Wrote", OUT_JSON);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
