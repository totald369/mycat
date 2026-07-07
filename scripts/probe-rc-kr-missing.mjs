/**
 * royalcanin.com/kr 고양이 제품 전수 probe → CSV 미등록 목록
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  "Accept-Language": "ko-KR,ko;q=0.9",
  Referer: "https://www.royalcanin.com/kr/",
};

const paths = JSON.parse(
  readFileSync(join(process.cwd(), "scripts/rc-kr-discovered-paths.json"), "utf8"),
);

const RC_RETAIL = [
  "mother-&-babycat-2544", "kitten-2522", "kitten-spayed--neutered-2562",
  "sterilised-37-2537", "indoor-adult-2529", "hairball-care-2534",
  "urinary-care-1800", "weight-care-2524", "digestive-care-2555",
  "dental-care-2532", "hair&skin-care-2526", "indoor-7+-2548",
  "indoor-long-hair-usa-only-2549", "aging-11+-2561", "ageing-15+-8075",
  "british-shorthair-aging-11+-2561", "british-shorthair--adult-2557",
  "fit-and-active-2520", "fussy-2531", "aroma-exigent-2543",
  "protein-exigent-2542", "sensitive-digestion-2521", "persian-adult-2552",
  "persian-kitten-2554", "ragdoll-adult-2515", "siamese-adult-2551",
  "bengal-adult-4370", "maine-coon-adult-2550", "appetite-control-care-2563",
];

const VET = [
  "renal-special-3949", "renal-select-4160", "early-renal-1242", "renal-1246",
  "urinary-so-3901", "urinary-so-moderate-calorie-3954", "urinary-so-1254",
  "gastrointestinal-3905", "gastrointestinal-moderate-calorie-4008",
  "gastrointestinal-fibre-response-4007", "gastrointestinal-4039",
  "hypoallergenic-3902", "anallergenic-1950", "satiety-weight-management-3943",
  "neutered-satiety-balance-2721", "diabetic-3906", "hepatic-4012",
  "mobility-3904", "recovery-1243", "cardiac-3903",
];

const WET = [
  "digest-sensitive-gravy", "hairball-care-gravy", "urinary-care-gravy",
  "ultra-light-gravy", "ultra-light-jelly", "intense-beauty-gravy",
  "intense-beauty-jelly", "kitten-gravy", "kitten-jelly",
  "instinctive-7+-gravy-4083",
  "indoor-sterilized-7+-morsels-in-gravy-1305", "instinctive-gravy",
  "instinctive-jelly", "sterilised-gravy", "sensory-smell-gravy",
  "sensory-taste-gravy", "sensory-feel-gravy", "mother-and-babycat-mousse",
  "kitten-mousse", "instinctive-mousse", "aging-11+-mousse", "aging-15+-mousse",
];

const slugMap = {
  "mother-&-babycat-2544": "01tdJ000002FJKXQA4",
  "mother-and-babycat-2018": "01tdJ000002FJKXQA4",
  "kitten-2522": "01tdJ000002FJKZQA4",
  "kitten-2018": "01tdJ000002FJKZQA4",
  "kitten-spayed--neutered-2562": "01tdJ000002FJKbQAO",
  "kitten-sterilised-2018": "01tdJ000002FJKbQAO",
  "oral-care-2532": "01tdJ000002FJL0QAO",
  "dental-care-2532": "01tdJ000002FJL0QAO",
  "light-weight-care-2524": "01tdJ000002FJKxQAO",
  "weight-care-2524": "01tdJ000002FJKxQAO",
  "hair-&-skin-care-2526": "01tdJ000002FJL1QAO",
  "hair&skin-care-2526": "01tdJ000002FJL1QAO",
  "bengal": "01tdJ000002FJL6QAO",
  "bengal-adult-4370": "01tdJ000002FJL6QAO",
  "persian": "01tdJ000002FJL3QAO",
  "persian-adult-2552": "01tdJ000002FJL3QAO",
  "siamese": "01tdJ000002FJL8QAO",
  "siamese-adult-2551": "01tdJ000002FJL8QAO",
  "british-shorthair": "01tdJ000002FJL7QAO",
  "british-shorthair--adult-2557": "01tdJ000002FJL7QAO",
  "instinctive-7+-gravy-4083": "01tdJ000002FJKqQAO",
  "digest-sensitive-gravy": "01tdJ000002FJM9QAO",
};

function normKey(s) {
  return String(s ?? "")
    .toLowerCase()
    .replace(/[\s\-_/·.,''+&캣cat파우치그레이비젤리무스습식]+/g, "");
}

function parseCsv() {
  const raw = readFileSync(join(process.cwd(), "prisma/cat_food.csv"), "utf8");
  return raw
    .split(/\n/)
    .filter((l) => l.includes("로얄캐닌"))
    .map((l) => {
      const id = l.split(",")[0];
      const name = l.match(/^[^,]+,[^,]+,([^,]+),/)?.[1] ?? "";
      return { id, name, key: normKey(name) };
    });
}

function isReg(p, csv) {
  const mid = slugMap[p.slug];
  if (mid && csv.some((r) => r.id === mid)) return true;
  const tk = normKey(p.title);
  if (csv.some((r) => r.key === tk)) return true;
  for (const r of csv) {
    if (r.key.length >= 4 && (tk.includes(r.key) || r.key.includes(tk)))
      return true;
  }
  return false;
}

async function fetchPath(path) {
  const parts = path.split("/");
  const slug = parts.pop();
  const url = `https://www.royalcanin.com${parts.join("/")}/${encodeURIComponent(slug)}`;
  for (let i = 0; i < 4; i++) {
    const html = await fetch(url, { headers }).then((r) => r.text());
    if (html.length > 5000) {
      const m = html.match(/__NEXT_DATA__[^>]*>([\s\S]*?)<\/script>/);
      const r = m
        ? JSON.parse(m[1]).props?.pageProps?.productData?.response
        : null;
      if (r?.title) {
        return {
          path,
          slug,
          title: r.title,
          technology: r.technology,
          servingG:
            r.technology === "wet"
              ? (r.original_product?.packs?.[0]?.weight_in_grams ?? 85)
              : null,
          url,
        };
      }
    }
    await new Promise((r) => setTimeout(r, 500 * (i + 1)));
  }
  return null;
}

const allPaths = new Set(paths);
for (const s of RC_RETAIL)
  allPaths.add(`/kr/cats/products/retail-products/${s}`);
for (const s of VET) allPaths.add(`/kr/cats/products/vet-products/${s}`);
for (const s of WET)
  allPaths.add(`/kr/cats/products/retail-products/${s}`);

const csv = parseCsv();
const found = [];
const missing = [];

for (const path of [...allPaths].sort()) {
  const p = await fetchPath(path);
  if (!p) {
    process.stderr.write("x");
    continue;
  }
  found.push(p);
  if (!isReg(p, csv)) {
    missing.push(p);
    process.stderr.write("+");
  } else process.stderr.write(".");
  await new Promise((r) => setTimeout(r, 300));
}

writeFileSync(
  join(process.cwd(), "scripts/rc-kr-missing.json"),
  JSON.stringify({ found: found.length, missing, all: found }, null, 2),
);
console.error(`\nfound ${found.length} missing ${missing.length}`);
for (const m of missing) {
  console.log(`${m.technology}\t${m.title}\t${m.slug}\t${m.url}`);
}
