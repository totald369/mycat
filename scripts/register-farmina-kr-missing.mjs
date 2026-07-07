/**
 * farmina.com/kr 고양이 eshop — 미등록 탐지 + 스크래핑 + cat_food.csv 추가
 * Usage:
 *   node scripts/register-farmina-kr-missing.mjs [--dry-run]
 *   node scripts/register-farmina-kr-missing.mjs --refresh [--dry-run]
 */
import { readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";

const DRY = process.argv.includes("--dry-run");
const REFRESH = process.argv.includes("--refresh");
const CSV_PATH = join(process.cwd(), "prisma", "cat_food.csv");
const CATALOG_PATH = join(process.cwd(), "scripts", "farmina-kr-catalog.json");
const OUT_JSON = join(process.cwd(), "scripts", "farmina-kr-register-result.json");

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept-Language": "ko-KR,ko;q=0.9",
};

const CAT_BASE =
  "https://www.farmina.com/kr/eshop-cat/Cat-%EB%B0%98%EB%A0%A4%EB%AC%98";
const KR_ESHOP = "https://www.farmina.com/kr/eshop/cat-%EB%B0%98%EB%A0%A4%EB%AC%98";

const LINE_PREFIX = {
  "n%26d-quinoa": "N&D 퀴노아 Cat",
  "n%26d-prime-feline": "N&D 프라임 Cat",
  "n%26d-ancestral-grain": "N&D 엔세스트럴 Cat",
  "n%26d-tropical-selection": "N&D 트로피컬 Cat",
};

const LINES = [
  { idlinea: 56, page: `${CAT_BASE}/56-N&D-Quinoa.html`, pathSlug: "n%26d-quinoa" },
  { idlinea: 15, page: `${CAT_BASE}/15-N&D-Prime.html`, pathSlug: "n%26d-prime-feline" },
  { idlinea: 16, page: `${CAT_BASE}/16-N&D-Ancestral-Grain.html`, pathSlug: "n%26d-ancestral-grain" },
  { idlinea: 91, page: `${CAT_BASE}/91-N&D-Tropical-Selection.html`, pathSlug: "n%26d-tropical-selection" },
];

/** slug 꼬리 → 한글 레시피명 (KR 페이지 미번역 시) */
const SLUG_KO = {
  "digestion-wet-food": "소화 케어 습식",
  "skin-&-coat-duck-wet-food": "피부·털 오리 습식",
  "skin-&-coat-herring-wet-food": "피부·털 청어 습식",
  "skin-&-coat-quail-wet-food": "피부·털 메추라기 습식",
  "skin-&-coat-venison-wet-food": "피부·털 사슴 습식",
  "urinary-wet-food": "유리너리 습식",
  "weight-management-wet-food": "체중관리 습식",
  digestion: "소화",
  "skin-&-coat-herring": "피부·털 청어",
  "skin-&-coat-quail": "피부·털 메추라기",
  "urinary-duck": "유리너리 오리",
  "weight-management-lamb": "체중관리 양고기",
  neutered: "오리, 브로콜리, 아스파라거스 중성화",
  "hairball-control": "헤어볼",
  "chicken-&-pomegranate-kitten-wet-food": "키튼 닭고기와 석류 습식",
  "boar-and-apple-wet-food": "멧돼지와 사과 습식",
  "chicken-and-pomegranate-wet-food": "닭고기와 석류 습식",
  "lamb-and-blueberry-wet-food": "양고기와 블루베리 습식",
  "chicken-&-pomegranate-kitten": "키튼 닭고기와 석류",
  "chicken-&-pomegranate-adult": "닭고기와 석류 어덜트",
  "chicken-&-pomegranate-neutered": "닭고기와 석류 중성화",
  "boar-&-apple-adult": "멧돼지와 사과 어덜트",
  "lamb-&-blueberry-adult": "양고기와 블루베리 어덜트",
  "chicken,-spelt,-oats-and-tropical-fruits-feline": "닭고기 & 열대 과일",
  "neutered-•-chicken,-spelt,-oats-and-tropical-fruits-feline": "중성화 닭고기 & 열대 과일",
  "neutered-•-lamb,-spelt,-oats-and-tropical-fruits-feline": "중성화 양고기 & 열대 과일",
};

function normKey(s) {
  return String(s ?? "")
    .toLowerCase()
    .replace(/파미나|farmina|n&d|nd/gi, "")
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
    "파미나",
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

function parseCsvFarmina() {
  const raw = readFileSync(CSV_PATH, "utf8");
  const ids = new Set();
  const keys = new Set();
  for (const line of raw.split(/\r?\n/)) {
    if (!line.includes("파미나")) continue;
    const id = line.split(",")[0];
    const name = line.match(/^[^,]+,[^,]+,([^,]+),/)?.[1] ?? "";
    ids.add(id);
    keys.add(normKey(name));
    const fmId = id.match(/FM-KR-(\d+)/)?.[1];
    if (fmId) ids.add(fmId);
  }
  return { ids, keys };
}

function isRegistered(spec, { ids, keys }) {
  if (ids.has(spec.id)) return true;
  if (ids.has(String(spec.product_id))) return true;
  if (spec.name && spec.name !== "NOT FOUND" && keys.has(normKey(spec.name))) return true;
  return false;
}

function buildKoreanName(lineSlug, slug, krName, enName) {
  if (krName && krName !== "NOT FOUND") return krName;
  const prefix = LINE_PREFIX[lineSlug] ?? "N&D Cat";
  const suffix = SLUG_KO[slug] ?? enName?.replace(/\s+/g, " ").trim();
  return suffix ? `${prefix} ${suffix}` : prefix;
}

function parseProductHtml(html) {
  const h1 =
    html
      .match(/<h1[^>]*class="[^"]*product-title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i)?.[1]
      ?.replace(/<[^>]+>/g, "")
      ?.replace(/\s+/g, " ")
      ?.trim() ?? "";

  const compBlocks = [...html.matchAll(/<p class="comp">([\s\S]*?)<\/p>/gi)].map((m) =>
    m[1]
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/\s+/g, " ")
      .replace(/\s*파미나 코리아.*$/i, "")
      .trim(),
  );

  const ingredients =
    compBlocks.find((b) => {
      if (b.length < 40) return false;
      if (/EM Kcal|kcal\/kg|Mj\/Kg|crude protein|Nutritional additives|Unlock the power/i.test(b)) {
        return false;
      }
      return /,/.test(b) && /(meat|chicken|lamb|duck|fish|herring|quinoa|오리|닭|양고기|고기|퀴노아|청어)/i.test(b);
    }) ?? "";

  let kcalKg = null;
  const meKg =
    html.match(/EM Kcal\/Kg\s*([0-9][0-9.,]*)/i) ??
    html.match(/M\.E\.\s*\(CEN\)\s*([0-9][0-9.,]*)\s*kcal\/kg/i) ??
    html.match(/대사\s*에너지[^0-9]*([0-9][0-9.,]*)\s*kcal\/kg/i);
  if (meKg) kcalKg = Number(meKg[1].replace(/,/g, ""));

  if (!kcalKg) {
    const meLb = html.match(/EM Kcal\/lb\s*([0-9][0-9.,]*)/i);
    if (meLb) kcalKg = Math.round(Number(meLb[1].replace(/,/g, "")) * 2.20462);
  }

  const parts = [];
  for (const [label, re] of [
    ["단백질", /조단백질[^0-9]*([0-9.]+)\s*%/i],
    ["지방", /조지방[^0-9]*([0-9.]+)\s*%/i],
    ["조섬유", /조(?:섬유|원섬유)[^0-9]*([0-9.]+)\s*%/i],
    ["조회분", /조회분[^0-9]*([0-9.]+)\s*%/i],
    ["수분", /수분[^0-9]*([0-9.]+)\s*%/i],
  ]) {
    const m = html.match(re);
    if (m) parts.push(`${label} ${m[1]}%`);
  }

  if (!parts.length) {
    const enMap = [
      ["단백질", /crude protein[^0-9]*([0-9.]+)\s*%/i],
      ["지방", /crude fat[^0-9]*([0-9.]+)\s*%/i],
      ["조섬유", /crude fiber[^0-9]*([0-9.]+)\s*%/i],
      ["조회분", /ash[^0-9]*([0-9.]+)\s*%/i],
      ["수분", /moisture[^0-9]*([0-9.]+)\s*%/i],
    ];
    for (const [label, re] of enMap) {
      const m = html.match(re);
      if (m) parts.push(`${label} ${m[1]}%`);
    }
  }

  return {
    h1,
    ingredients,
    kcalKg,
    nutrition_analysis: [parts.join(", "), kcalKg ? `ME ${kcalKg} kcal/kg` : ""]
      .filter(Boolean)
      .join(", "),
  };
}

function inferMeta(name, url, slug) {
  const blob = `${name} ${url} ${slug}`;
  const isWet = /wet|습식|캔|파우치/i.test(blob) || /wet-food/i.test(slug);
  const isPrescription = /vetlife|처방/i.test(blob);

  let life_stage = "adult_1y_plus";
  if (/키튼|kitten/i.test(blob)) life_stage = "kitten_0_12m";
  else if (/시니어|senior|7\+|11\+/i.test(blob)) life_stage = "senior_7y_plus";
  else if (/전연령|all life/i.test(blob)) life_stage = "all_life_stage";

  let condition = "none";
  if (/비뇨|urinary/i.test(blob)) condition = "urinary";
  else if (/소화|digest/i.test(blob)) condition = "digestive";
  else if (/피부|skin|coat/i.test(blob)) condition = "skin";
  else if (/체중|weight/i.test(blob)) condition = "weight";
  else if (/헤어볼|hairball/i.test(blob)) condition = "hairball";

  let serving_g = "";
  if (isWet) {
    const g = blob.match(/\b(70|80|85)g\b/i);
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

async function fetchAjaxProductLinks(pageUrl, idlinea) {
  const res = await fetch(pageUrl, { headers });
  const html = await res.text();
  const body = new URLSearchParams({
    prima: "si",
    idpagina: "83",
    idlingua: "54",
    idlinea: String(idlinea),
    specie: "c",
  });
  const ajaxRes = await fetch("https://www.farmina.com/a_prodotti_eshop.php", {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/x-www-form-urlencoded", Referer: pageUrl },
    body,
  });
  const ajax = await ajaxRes.text();
  const entries = new Map();
  for (const m of ajax.matchAll(/href=['"](https:\/\/www\.farmina\.com\/[^'"]+\/(\d+)-([^'"]+))['"]/gi)) {
    entries.set(m[2], { usUrl: m[1], slug: m[3].replace(/\.html$/, "") });
  }
  return entries;
}

async function resolveKrUrl(pathSlug, productId, slug) {
  const url = `${KR_ESHOP}/${pathSlug}/${productId}-${slug}.html`;
  const res = await fetch(url, { method: "HEAD", headers, redirect: "follow" });
  if (res.ok) return url;
  return null;
}

async function scrapeProduct({ productId, krUrl, usUrl, lineSlug, slug }) {
  const krRes = await fetch(krUrl, { headers });
  const krHtml = await krRes.text();
  let parsed = parseProductHtml(krHtml);

  let enName = "";
  if (!parsed.ingredients || parsed.h1 === "NOT FOUND" || !parsed.h1) {
    const usRes = await fetch(usUrl, { headers: { ...headers, "Accept-Language": "en-US,en;q=0.9" } });
    const usHtml = await usRes.text();
    const usParsed = parseProductHtml(usHtml);
    enName = usParsed.h1;
    if (!parsed.ingredients) parsed.ingredients = usParsed.ingredients;
    if (!parsed.kcalKg) parsed.kcalKg = usParsed.kcalKg;
    if (!parsed.nutrition_analysis || parsed.nutrition_analysis === "") {
      parsed.nutrition_analysis = usParsed.nutrition_analysis;
    }
  }

  const name = buildKoreanName(lineSlug, slug, parsed.h1, enName);
  const meta = inferMeta(name, `${krUrl} ${slug}`, slug);

  return {
    id: `FM-KR-${productId}`,
    product_id: productId,
    name,
    url: krUrl,
    us_url: usUrl,
    line: lineSlug,
    slug,
    kcal_per_100g: parsed.kcalKg ? Math.round(parsed.kcalKg / 10) : "",
    ingredients: parsed.ingredients,
    nutrition_analysis: parsed.nutrition_analysis,
    ...meta,
  };
}

async function discoverKrProducts() {
  const found = [];
  for (const line of LINES) {
    const ajaxProducts = await fetchAjaxProductLinks(line.page, line.idlinea);
    for (const [productId, { usUrl, slug }] of ajaxProducts) {
      const krUrl = await resolveKrUrl(line.pathSlug, productId, slug);
      if (krUrl) found.push({ productId, krUrl, usUrl, lineSlug: line.pathSlug, slug });
      await new Promise((r) => setTimeout(r, 60));
    }
  }
  return found;
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
  console.log("Discovering Farmina KR cat products...");
  const discovered = await discoverKrProducts();
  console.log("Discovered KR URLs:", discovered.length);

  const catalog = [];
  for (const item of discovered) {
    try {
      const spec = await scrapeProduct(item);
      catalog.push(spec);
      console.log("OK", spec.id, spec.name.slice(0, 55));
      await new Promise((r) => setTimeout(r, 180));
    } catch (e) {
      console.error("FAIL", item.productId, e.message);
    }
  }

  if (!DRY) {
    writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2));
    console.log("Wrote", CATALOG_PATH);
  }

  if (REFRESH) {
    const updated = refreshCsvRows(catalog);
    console.log(`Refreshed ${updated} existing rows`);
  } else {
    const index = parseCsvFarmina();
    const toAdd = catalog.filter((s) => !isRegistered(s, index));
    console.log(`Catalog: ${catalog.length}, missing: ${toAdd.length}`);
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
