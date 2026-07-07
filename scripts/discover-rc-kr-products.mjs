/**
 * royalcanin.com/kr 고양이 제품 목록 수집 + cat_food.csv 미등록 탐지
 * Usage: node scripts/discover-rc-kr-products.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RC_RETAIL_SLUGS = [
  "mother-&-babycat-2544",
  "kitten-2522",
  "kitten-spayed--neutered-2562",
  "sterilised-37-2537",
  "indoor-adult-2529",
  "hairball-care-2534",
  "urinary-care-1800",
  "weight-care-2524",
  "digestive-care-2555",
  "dental-care-2532",
  "hair&skin-care-2526",
  "indoor-7+-2548",
  "indoor-long-hair-usa-only-2549",
  "aging-11+-2561",
  "ageing-15+-8075",
  "british-shorthair-aging-11+-2561",
  "british-shorthair--adult-2557",
  "fit-and-active-2520",
  "fussy-2531",
  "savour-exigent-33-2531",
  "aroma-exigent-2543",
  "protein-exigent-2542",
  "sensitive-digestion-2521",
  "persian-adult-2552",
  "persian-kitten-2554",
  "ragdoll-adult-2515",
  "siamese-adult-2551",
  "bengal-adult-4370",
];

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "ko-KR,ko;q=0.9",
  Referer: "https://www.royalcanin.com/kr/",
};

const VET_SLUGS = [
  "renal-special-3949",
  "renal-select-4160",
  "early-renal-1242",
  "renal-1246",
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
  "neutered-satiety-balance-2721",
  "diabetic-3906",
  "hepatic-4012",
  "mobility-3904",
  "recovery-1243",
  "cardiac-3903",
];

const EXTRA_RETAIL = [
  "maine-coon-adult-2550",
  "appetite-control-care-2563",
  "bengal",
  "british-shorthair",
  "persian",
  "siamese",
  "digest-sensitive-gravy",
  "hairball-care-gravy",
  "urinary-care-gravy",
  "ultra-light-gravy",
  "ultra-light-jelly",
  "intense-beauty-gravy",
  "intense-beauty-jelly",
  "kitten-gravy",
  "kitten-jelly",
  "kitten-2018",
  "kitten-sterilised-2018",
  "mother-and-babycat-2018",
  "instinctive-7+-gravy-4083",
  "indoor-sterilized-7+-morsels-in-gravy-1305",
  "instinctive-gravy",
  "instinctive-jelly",
  "sterilised-gravy",
  "sterilised-jelly",
  "savour-exigent-gravy",
  "savour-exigent-jelly",
  "aroma-exigent-gravy",
  "protein-exigent-gravy",
  "sensitive-digestion-gravy",
  "hair-and-skin-care-gravy",
  "digestive-care-gravy",
  "light-weight-care-gravy",
  "oral-care-2532",
  "dental-care-2532",
  "light-weight-care-2524",
  "weight-care-2524",
  "sensory-smell-gravy",
  "sensory-taste-gravy",
  "sensory-feel-gravy",
  "mother-and-babycat-mousse",
  "kitten-mousse",
  "instinctive-mousse",
  "instinctive-7+-mousse",
  "aging-11+-mousse",
  "aging-15+-mousse",
];

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
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function normKey(s) {
  return String(s ?? "")
    .toLowerCase()
    .replace(/[\s\-_/·.,'’+&]+/g, "");
}

function parseCsvIds() {
  const raw = readFileSync(join(process.cwd(), "prisma", "cat_food.csv"), "utf8");
  const rows = raw.split(/\r?\n/).slice(1);
  const rc = [];
  for (const line of rows) {
    if (!line.trim() || !line.includes("로얄캐닌")) continue;
    const id = line.split(",")[0];
    const nameMatch = line.match(/^[^,]+,[^,]+,([^,]+),/);
    const name = nameMatch?.[1] ?? "";
    rc.push({ id, name, key: normKey(name) });
  }
  return rc;
}

function slugFromPath(p) {
  const parts = p.split("/");
  return decodeURIComponent(parts[parts.length - 1]);
}

async function fetchCategorySlugs() {
  const slugs = new Set();
  for (const page of CATEGORY_PAGES) {
    for (let attempt = 0; attempt < 3; attempt++) {
      const url = `https://www.royalcanin.com/kr/cats/products/${page}`;
      const html = await fetch(url, { headers }).then((r) => r.text());
      if (html.length < 1000) {
        await sleep(800);
        continue;
      }
      for (const m of html.matchAll(
        /\/kr\/cats\/products\/(retail-products|vet-products)\/([a-z0-9&+._%-]+)/gi,
      )) {
        slugs.add(`${m[1]}/${decodeURIComponent(m[2])}`);
      }
      break;
    }
    await sleep(300);
  }
  return [...slugs];
}

async function fetchProduct(base, slug) {
  const url = `https://www.royalcanin.com/kr/cats/products/${base}/${slug}`;
  const html = await fetch(url, { headers }).then((r) => r.text());
  if (html.length < 5000) return null;
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return null;
  const r = JSON.parse(m[1]).props?.pageProps?.productData?.response;
  if (!r?.title) return null;
  const servingG =
    r.technology === "wet"
      ? (r.original_product?.packs?.[0]?.weight_in_grams ?? 85)
      : null;
  return {
    url,
    slug,
    base,
    title: r.title,
    titleKey: normKey(r.title),
    technology: r.technology,
    servingG,
  };
}

function isRegistered(product, csvRows, slugFeedId) {
  const mappedId = slugFeedId[product.slug];
  if (mappedId && csvRows.some((r) => r.id === mappedId)) return true;

  if (csvRows.some((r) => r.key === product.titleKey)) return true;

  // 부분 일치 (한글 공식명 변형)
  for (const row of csvRows) {
    if (row.key.length >= 4 && product.titleKey.includes(row.key)) return true;
    if (product.titleKey.length >= 4 && row.key.includes(product.titleKey)) return true;
  }
  return false;
}

const slugFeedId = {
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
  "british-shorthair": "01tdJ000002FJL7QAO",
  "fit-and-active-2520": "01tdJ000002FJKhQAO",
  "fussy-2531": "01tdJ000002FJKiQAO",
  "aroma-exigent-2543": "01tdJ000002FJKjQAO",
  "protein-exigent-2542": "01tdJ000002FJKkQAO",
  "sensitive-digestion-2521": "01tdJ000002FJKgQAO",
  "persian-adult-2552": "01tdJ000002FJL3QAO",
  "persian": "01tdJ000002FJL3QAO",
  "persian-kitten-2554": "01tdJ000002FJL2QAO",
  "ragdoll-adult-2515": "01tdJ000002FJL5QAO",
  "siamese-adult-2551": "01tdJ000002FJL8QAO",
  "siamese": "01tdJ000002FJL8QAO",
  "bengal-adult-4370": "01tdJ000002FJL6QAO",
  "bengal": "01tdJ000002FJL6QAO",
};

const csvRows = parseCsvIds();

const candidates = new Set();
for (const slug of RC_RETAIL_SLUGS) candidates.add(`retail-products/${slug}`);
for (const slug of EXTRA_RETAIL) candidates.add(`retail-products/${slug}`);
for (const slug of VET_SLUGS) candidates.add(`vet-products/${slug}`);

const fromPages = await fetchCategorySlugs();
for (const p of fromPages) candidates.add(p);

console.error(`Probing ${candidates.size} candidate slugs…`);

const found = [];
const missing = [];

for (const path of [...candidates].sort()) {
  const [base, slug] = path.split("/");
  try {
    const p = await fetchProduct(base, slug);
    if (!p) continue;
    found.push(p);
    const reg = isRegistered(p, csvRows, slugFeedId);
    if (!reg) missing.push(p);
    process.stderr.write(reg ? "." : `+${p.title} `);
  } catch (e) {
    process.stderr.write("x");
  }
  await sleep(250);
}

const out = {
  scanned: candidates.size,
  foundOnKr: found.length,
  missingCount: missing.length,
  missing,
  allKr: found,
};

const outPath = join(process.cwd(), "scripts", "rc-kr-missing.json");
writeFileSync(outPath, JSON.stringify(out, null, 2));
console.error(`\nWrote ${outPath}`);
console.error(`KR products: ${found.length}, missing from CSV: ${missing.length}`);
for (const m of missing) {
  console.log(`${m.technology}\t${m.title}\t${m.slug}\t${m.url}`);
}
