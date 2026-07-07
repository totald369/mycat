/**
 * royalcanin.com/kr 고양이 제품 — 미등록 탐지 + 스크래핑 + cat_food.csv 추가
 * Usage: node scripts/register-rc-kr-missing.mjs [--dry-run]
 */
import { readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";

const DRY = process.argv.includes("--dry-run");
const CSV_PATH = join(process.cwd(), "prisma", "cat_food.csv");
const OUT_JSON = join(process.cwd(), "scripts", "rc-kr-register-result.json");

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
  Accept: "text/html,application/xhtml+xml",
};

const CATEGORY_PAGES = [
  "feline-health-nutrition",
  "feline-care-nutrition",
  "feline-breed-nutrition",
  "feline-wet-range",
  "wet-sensory",
  "ageing-and-senior",
  "kitten",
  "kitten-growth-program",
  "weight",
  "dermatology",
  "vet-products",
];

const EXTRA_SLUGS = [
  "mother-&-babycat-2544",
  "kitten-2522",
  "kitten-spayed--neutered-2562",
  "sterilised-37-2537",
  "indoor-adult-2529",
  "hairball-care-2534",
  "urinary-care-1800",
  "weight-care-2524",
  "light-weight-care-2524",
  "digestive-care-2555",
  "dental-care-2532",
  "oral-care-2532",
  "hair&skin-care-2526",
  "hair-&-skin-care-2526",
  "indoor-7+-2548",
  "indoor-long-hair-usa-only-2549",
  "aging-11+-2561",
  "ageing-15+-8075",
  "british-shorthair-aging-11+-2561",
  "british-shorthair--adult-2557",
  "fit-and-active-2520",
  "fussy-2531",
  "aroma-exigent-2543",
  "protein-exigent-2542",
  "sensitive-digestion-2521",
  "persian-adult-2552",
  "persian-kitten-2554",
  "ragdoll-adult-2515",
  "siamese-adult-2551",
  "bengal-adult-4370",
  "maine-coon-adult-2550",
  "appetite-control-care-2563",
  "digest-sensitive-gravy",
  "hairball-care-gravy",
  "urinary-care-gravy",
  "ultra-light-gravy",
  "ultra-light-gravy-4070",
  "ultra-light-jelly",
  "ultra-light-jelly-4152",
  "intense-beauty-gravy",
  "intense-beauty-jelly",
  "kitten-gravy",
  "kitten-jelly",
  "instinctive-7+-gravy-4083",
  "indoor-sterilized-7+-morsels-in-gravy-1305",
  "instinctive-gravy",
  "instinctive-jelly",
  "sterilised-gravy",
  "sterilised-jelly",
  "sensory-smell-gravy",
  "sensory-taste-gravy",
  "sensory-feel-gravy",
  "mother-and-babycat-mousse",
  "kitten-mousse",
  "instinctive-mousse",
  "aging-11+-mousse",
  "aging-15+-mousse",
  "hair-and-skin-care-gravy",
  "digestive-care-gravy",
  "renal-special-3949",
  "renal-select-4160",
  "early-renal-1242",
  "renal-1246",
  "recovery-1243",
  "urinary-so-3901",
  "urinary-so-moderate-calorie-3954",
  "urinary-so-1254",
  "gastrointestinal-3905",
  "gastrointestinal-moderate-calorie-4008",
  "gastrointestinal-fibre-response-4007",
  "gastrointestinal-4039",
  "hypoallergenic-3902",
  "anallergenic-1950",
  "satiety-weight-management-3943",
  "satiety-weight-management-1070",
  "neutered-satiety-balance-2721",
  "diabetic-3906",
  "hepatic-4012",
  "mobility-3904",
  "cardiac-3903",
];

/** slug → 기존 CSV id (동일 SKU 다른 URL) */
const SLUG_TO_EXISTING = {
  "mother-&-babycat-2544": "01tdJ000002FJKXQA4",
  "mother-and-babycat-2018": "01tdJ000002FJKXQA4",
  "kitten-2522": "01tdJ000002FJKZQA4",
  "kitten-2018": "01tdJ000002FJKZQA4",
  "kitten-spayed--neutered-2562": "01tdJ000002FJKbQAO",
  "kitten-sterilised-2018": "01tdJ000002FJKbQAO",
  "sterilised-37-2537": "01tdJ000002FJLyQAO",
  "indoor-adult-2529": "01tdJ000002FJKcQAO",
  "hairball-care-2534": "01tdJ000002FJKtQAO",
  "urinary-care-1800": "01tdJ000002FJKvQAO",
  "weight-care-2524": "01tdJ000002FJKxQAO",
  "light-weight-care-2524": "01tdJ000002FJKxQAO",
  "digestive-care-2555": "01tdJ000002FJKzQAO",
  "dental-care-2532": "01tdJ000002FJL0QAO",
  "oral-care-2532": "01tdJ000002FJL0QAO",
  "hair&skin-care-2526": "01tdJ000002FJL1QAO",
  "hair-&-skin-care-2526": "01tdJ000002FJL1QAO",
  "indoor-7+-2548": "01tdJ000002FJKoQAO",
  "indoor-long-hair-usa-only-2549": "01tdJ000002FJKfQAO",
  "aging-11+-2561": "01tdJ000003UyOQQA0",
  "ageing-15+-8075": "01tdJ000003UzCPQA0",
  "british-shorthair-aging-11+-2561": "01tdJ000002FJL4QAO",
  "british-shorthair--adult-2557": "01tdJ000002FJL7QAO",
  "fit-and-active-2520": "01tdJ000002FJKhQAO",
  "fussy-2531": "01tdJ000002FJKiQAO",
  "aroma-exigent-2543": "01tdJ000002FJKjQAO",
  "protein-exigent-2542": "01tdJ000002FJKkQAO",
  "sensitive-digestion-2521": "01tdJ000002FJKgQAO",
  "persian-adult-2552": "01tdJ000002FJL3QAO",
  "persian-kitten-2554": "01tdJ000002FJL2QAO",
  "ragdoll-adult-2515": "01tdJ000002FJL5QAO",
  "siamese-adult-2551": "01tdJ000002FJL8QAO",
  "bengal-adult-4370": "01tdJ000002FJL6QAO",
  "digest-sensitive-gravy": "01tdJ000002FJM9QAO",
  "digestive-care-gravy": "01tdJ000002FJM9QAO",
  "hairball-care-gravy": "01tdJ000002FJKuQAO",
  "urinary-care-gravy": "01tdJ000002FJKwQAO",
  "ultra-light-gravy": "01tdJ000002FJKyQAO",
  "ultra-light-gravy-4070": "01tdJ000002FJKyQAO",
  "kitten-gravy": "01tdJ000002FJKaQAO",
  "kitten-jelly": "01tdJ000002FJKaQAO",
  "instinctive-gravy": "01tdJ000002FJKeQAO",
  "instinctive-7+-gravy-4083": "01tdJ000002FJKqQAO",
  "indoor-sterilized-7+-morsels-in-gravy-1305": "01tdJ000002FJKpQAO",
  "sterilised-gravy": "01tdJ000002FJLzQAO",
  "mother-and-babycat-mousse": "01tdJ000002FJM6QAO",
  "sensory-smell-gravy": "01tdJ000002FJKlQAO",
  "sensory-taste-gravy": "01tdJ000002FJKmQAO",
  "sensory-feel-gravy": "01tdJ000002FJKnQAO",
  "hair-and-skin-care-gravy": "01tdJ000002FJM8QAO",
  "renal-special-3949": "73",
  "renal-select-4160": "74",
  "early-renal-1242": "75",
  "renal-1246": "76",
  "urinary-so-3901": "77",
  "urinary-so-moderate-calorie-3954": "78",
  "urinary-so-1254": "79",
  "gastrointestinal-3905": "80",
  "gastrointestinal-moderate-calorie-4008": "81",
  "gastrointestinal-fibre-response-4007": "82",
  "gastrointestinal-4039": "83",
  "hypoallergenic-3902": "84",
  "anallergenic-1950": "85",
  "satiety-weight-management-3943": "86",
  "satiety-weight-management-1070": "86",
  "neutered-satiety-balance-2721": "87",
  "diabetic-3906": "88",
  "hepatic-4012": "89",
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function normKey(s) {
  return String(s ?? "")
    .toLowerCase()
    .replace(/[\s\-_/·.,''+&캣cat파우치그레이비젤리무스습식파우치]+/g, "");
}

function csvEscape(s) {
  const v = String(s ?? "");
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function parseCsvRows() {
  const raw = readFileSync(CSV_PATH, "utf8");
  const rows = [];
  for (const line of raw.split(/\r?\n/).slice(1)) {
    if (!line.trim() || !line.includes("로얄캐닌")) continue;
    const id = line.split(",")[0];
    const name = line.match(/^[^,]+,[^,]+,([^,]+),/)?.[1] ?? "";
    rows.push({ id, name, key: normKey(name) });
  }
  return rows;
}

function isRegistered(slug, title, csvRows) {
  const mapped = SLUG_TO_EXISTING[slug];
  if (mapped && csvRows.some((r) => r.id === mapped)) return true;
  const tk = normKey(title);
  if (csvRows.some((r) => r.key === tk)) return true;
  // 핵심명 일치 (파우치/습식 변형)
  const core = tk.replace(/(파우치|그레이비|젤리|무스|케어)/g, "");
  for (const r of csvRows) {
    const rk = r.key.replace(/(파우치|그레이비|젤리|무스|케어|습식)/g, "");
    if (core.length >= 5 && rk.length >= 5 && core === rk) return true;
  }
  return false;
}

async function fetchHtml(url, retries = 4) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, {
      headers: { ...headers, Referer: url.split("/cats/")[0] + "/kr/" },
    });
    if (res.ok) {
      const text = await res.text();
      if (text.length > 5000) return text;
    }
    if (res.status === 403 || res.status === 429 || res.status === 422) {
      await sleep(1500 * (i + 1));
      continue;
    }
    await sleep(800 * (i + 1));
  }
  return null;
}

function parseResponse(html) {
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return null;
  return JSON.parse(m[1]).props?.pageProps?.productData?.response ?? null;
}

async function fetchProduct(slug, vet = false) {
  const base = vet ? "vet-products" : "retail-products";
  for (const locale of ["kr", "uk"]) {
    const url = `https://www.royalcanin.com/${locale}/cats/products/${base}/${encodeURIComponent(slug)}`;
    const html = await fetchHtml(url);
    if (!html) continue;
    const r = parseResponse(html);
    if (r?.title) {
      return { r, url, locale, slug, vet };
    }
  }
  return null;
}

async function discoverPaths() {
  const paths = new Set();
  for (const page of CATEGORY_PAGES) {
    for (let attempt = 0; attempt < 3; attempt++) {
      const url = `https://www.royalcanin.com/kr/cats/products/${page}`;
      const html = await fetchHtml(url);
      if (!html) {
        await sleep(1000);
        continue;
      }
      for (const m of html.matchAll(
        /\/kr\/cats\/products\/(retail-products|vet-products)\/([a-z0-9&+._%-]+)/gi,
      )) {
        paths.add(`${m[1]}/${decodeURIComponent(m[2])}`);
      }
      break;
    }
    await sleep(400);
  }
  for (const slug of EXTRA_SLUGS) {
    const vet = [
      "renal",
      "urinary-so",
      "gastrointestinal",
      "hypoallergenic",
      "anallergenic",
      "satiety",
      "neutered-satiety",
      "diabetic",
      "hepatic",
      "mobility",
      "cardiac",
      "recovery",
      "early-renal",
    ].some((p) => slug.startsWith(p));
    paths.add(`${vet ? "vet-products" : "retail-products"}/${slug}`);
  }
  return [...paths];
}

function cleanDisclaimer(text) {
  return text
    .replace(/※[\s\S]*$/u, "")
    .replace(/\\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getIngredients(r) {
  const comp =
    r.nutritionalInfo?.find((n) => n.title?.includes("composition"))
      ?.description ??
    r.original_product?.composition?.[0]?.composition ??
    "";
  const cleaned = cleanDisclaimer(comp);
  return cleaned.includes(",") ? cleaned : "";
}

function formatAnalytical(desc, technology, servingG) {
  if (!desc) return "";
  const text = cleanDisclaimer(desc);
  if (!text) return "";
  const isWet = technology === "wet";
  const fatLabel = isWet ? "지방" : "조지방";
  if (/%/.test(text)) {
    const parts = [];
    const map = [
      [/Protein:\s*([\d.]+)\s*%/i, "단백질"],
      [/Fat content:\s*([\d.]+)\s*%/i, fatLabel],
      [/Crude fibres?:\s*([\d.]+)\s*%/i, "조섬유"],
      [/Crude ash:\s*([\d.]+)\s*%/i, "조회분"],
      [/조?단백질\s*([\d.]+)\s*%/i, "단백질"],
      [/조?지방\s*([\d.]+)\s*%/i, fatLabel],
      [/조?섬유\s*([\d.]+)\s*%/i, "조섬유"],
      [/조?회분\s*([\d.]+)\s*%/i, "조회분"],
      [/칼슘\s*([\d.]+)\s*%/i, "칼슘"],
      [/인\s*([\d.]+)\s*%/i, "인"],
      [/수분\s*([\d.]+)\s*%/i, "수분"],
    ];
    for (const [re, label] of map) {
      const m = text.match(re);
      if (m && !parts.some((p) => p.startsWith(`${label} `))) {
        parts.push(`${label} ${m[1]}%`);
      }
    }
    if (parts.length) return parts.join(", ");
  }
  const simple = text
    .replace(/대사에너지\s*[\d.]+\s*kcal.*/i, "")
    .replace(/,\s*$/, "")
    .trim();
  if (simple.length > 10 && simple.length < 400) return simple;
  return "";
}

function getAnalyticalRaw(r) {
  return (
    r.nutritionalInfo?.find((n) => /analytical/i.test(n.title ?? ""))
      ?.description ??
    r.original_product?.composition?.find((c) => c.analytical_constituants)
      ?.analytical_constituants ??
    ""
  );
}

function getKcal(r) {
  const op = r.original_product ?? {};
  const servingG = op.packs?.[0]?.weight_in_grams;
  const analyt = getAnalyticalRaw(r);
  const me = analyt.match(/대사에너지\s*([\d.]+)\s*kcal/i)?.[1];
  if (r.technology === "wet" && me && servingG && servingG < 500) {
    return Math.round(Number(me) * 10) / 10;
  }
  if (op.density && op.density > 50) {
    return Math.round(op.density * 10) / 10;
  }
  const ref = op.reference_energy_value_per_weight;
  if (ref?.amount && ref.unit === "kcal/kg") {
    return Math.round((ref.amount / 10) * 10) / 10;
  }
  const per100 = JSON.stringify(op).match(/([\d.]+)\s*kcal per 100g/i)?.[1];
  if (per100) return Math.round(Number(per100) * 10) / 10;
  return null;
}

function formatKrName(title) {
  return title
    .replace(/\s+/g, " ")
    .replace(/캣\s*/g, "")
    .replace(/파우치\s*그레이비/g, "파우치 그레이비")
    .trim();
}

function inferMeta(slug, title, tech, vet) {
  const t = `${slug} ${title}`.toLowerCase();
  let type = tech === "wet" ? "wet" : "dry";
  let lifeStage = "adult_1y_plus";
  let category = vet ? "prescription" : "general";
  let condition = "none";

  if (/kitten|키튼|베이비캣|mother|babycat/i.test(t)) lifeStage = "kitten_4_12m";
  if (/7\+|7\+|senior|aging|ageing|에이징|노령/i.test(t))
    lifeStage = "senior_7y_plus";
  if (/11\+|11\+/i.test(t)) lifeStage = "senior_11y_plus";
  if (/15\+|15\+/i.test(t)) lifeStage = "senior_15y_plus";
  if (/steril|스테럴라이즈|neutered/i.test(t) && !vet)
    lifeStage = "adult_1_7y_neutered";
  if (/indoor(?!.*7)/i.test(t) && !/7/.test(t)) lifeStage = "adult_1_7y";

  if (/urinary|유리너리/i.test(t)) condition = "urinary";
  else if (/renal|레날|kidney/i.test(t)) condition = "kidney";
  else if (/digest|다이제스|gastro/i.test(t)) condition = "digestive";
  else if (/hairball|헤어볼/i.test(t)) condition = "hairball";
  else if (/weight|light|satiety|세타이어티|라이트/i.test(t))
    condition = "weight";
  else if (/hypo|anallerg|알러/i.test(t)) condition = "allergy";
  else if (/diabetic|다이아베/i.test(t)) condition = "diabetes";
  else if (/hepatic|헤파/i.test(t)) condition = "liver";
  else if (/dental|덴탈|oral/i.test(t)) condition = "dental";
  else if (/beauty|intense|헤어앤스킨|hair.*skin/i.test(t)) condition = "skin";
  else if (/mobility|모빌/i.test(t)) condition = "joint";
  else if (/cardiac|카디/i.test(t)) condition = "heart";

  return { type, lifeStage, category, condition };
}

function makeCsvRow(product) {
  const { r, slug, vet, pageId } = product;
  const name = formatKrName(r.title);
  const meta = inferMeta(slug, name, r.technology, vet);
  const servingG =
    r.technology === "wet"
      ? (r.original_product?.packs?.[0]?.weight_in_grams ?? 85)
      : "";
  const kcal = getKcal(r);
  const ingredients = getIngredients(r);
  const nutrition = formatAnalytical(
    getAnalyticalRaw(r),
    r.technology,
    servingG || null,
  );
  const id = `RC${pageId ?? slug.replace(/[^a-z0-9]/gi, "").slice(0, 12)}`;
  return [
    id,
    "로얄캐닌",
    name,
    meta.type,
    meta.lifeStage,
    kcal ?? "",
    servingG,
    "",
    "",
    meta.category,
    meta.condition,
    ingredients,
    nutrition,
  ]
    .map(csvEscape)
    .join(",");
}

const csvRows = parseCsvRows();
const paths = await discoverPaths();
console.error(`Discovered ${paths.length} candidate paths`);

const found = [];
const missing = [];

for (const path of paths.sort()) {
  const [kind, slug] = path.split("/");
  const vet = kind === "vet-products";
  const p = await fetchProduct(slug, vet);
  if (!p) {
    process.stderr.write("x");
    await sleep(2500);
    continue;
  }
  const pageId = p.r.id;
  const item = { ...p, pageId };
  found.push(item);
  if (!isRegistered(slug, p.r.title, csvRows)) {
    missing.push(item);
    process.stderr.write("+");
  } else {
    process.stderr.write(".");
  }
  await sleep(2500);
}

console.error(`\nFound ${found.length}, missing ${missing.length}`);

const newRows = [];
for (const m of missing) {
  const row = makeCsvRow(m);
  newRows.push(row);
  console.log(
    `NEW\t${m.r.technology}\t${formatKrName(m.r.title)}\t${m.slug}\t${m.url}`,
  );
}

const result = {
  scanned: paths.length,
  found: found.length,
  missingCount: missing.length,
  missing: missing.map((m) => ({
    slug: m.slug,
    title: m.r.title,
    url: m.url,
    technology: m.r.technology,
  })),
  newRows,
};

writeFileSync(OUT_JSON, JSON.stringify(result, null, 2));

if (!DRY && newRows.length) {
  const lines = newRows.join("\n") + "\n";
  appendFileSync(CSV_PATH, lines);
  console.error(`Appended ${newRows.length} rows to ${CSV_PATH}`);
} else if (DRY) {
  console.error(`[dry-run] would append ${newRows.length} rows`);
}
