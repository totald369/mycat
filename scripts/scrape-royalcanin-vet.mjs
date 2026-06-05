/**
 * royalcanin.com/kr 고양이 처방식 상세 스크래핑
 * Usage: node scripts/scrape-royalcanin-vet.mjs
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = "https://www.royalcanin.com/kr/cats/products/vet-products";
const LOCALE_FALLBACK = "https://www.royalcanin.com/uk/cats/products/vet-products";

/** csv id → slug (KR 우선, locale=uk는 slug만 동일) */
const PRODUCTS = [
  { id: "73", slug: "renal-special-3949" },
  { id: "74", slug: "renal-select-4160" },
  { id: "75", slug: "early-renal-1242" },
  { id: "76", slug: "renal-1246" },
  { id: "77", slug: "urinary-so-3901" },
  { id: "78", slug: "urinary-so-moderate-calorie-3954" },
  { id: "79", slug: "urinary-so-1254" },
  { id: "80", slug: "gastrointestinal-3905" },
  { id: "81", slug: "gastrointestinal-moderate-calorie-4008" },
  { id: "82", slug: "gastrointestinal-fibre-response-4007" },
  { id: "83", slug: "gastrointestinal-4039" },
  { id: "84", slug: "hypoallergenic-3902" },
  { id: "85", slug: "anallergenic-1950" },
  { id: "86", slug: "satiety-weight-management-3943" },
  { id: "87", slug: "neutered-satiety-balance-2721" },
  { id: "88", slug: "diabetic-3906" },
  { id: "89", slug: "hepatic-4012" },
];

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
  Accept: "text/html,application/xhtml+xml",
  Referer: "https://www.royalcanin.com/kr/cats/products/vet-products",
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchHtml(url, retries = 4) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, { headers });
    if (res.ok) return res.text();
    if (res.status === 403 || res.status === 429) {
      await sleep(1500 * (i + 1));
      continue;
    }
    throw new Error(`HTTP ${res.status} ${url}`);
  }
  throw new Error(`HTTP fail ${url}`);
}

function cleanDisclaimer(text) {
  return text
    .replace(/※[\s\S]*$/u, "")
    .replace(/\\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseResponse(html) {
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return null;
  const pd = JSON.parse(m[1]).props?.pageProps?.productData;
  return pd?.response ?? null;
}

function getIngredients(r) {
  const comp =
    r.nutritionalInfo?.find((n) =>
      n.title?.includes("composition"),
    )?.description ??
    r.original_product?.composition?.[0]?.composition ??
    "";
  const cleaned = cleanDisclaimer(comp);
  return cleaned.includes(",") ? cleaned : "";
}

function formatAnalytical(desc, technology, servingG) {
  if (!desc) return "";
  const text = cleanDisclaimer(desc);
  if (!text) return "";

  if (/%/.test(text)) {
    const parts = [];
    const map = [
      [/조?단백질\s*([\d.]+)\s*%/i, "단백질"],
      [/단백질\s*([\d.]+)\s*%/i, "단백질"],
      [/조?지방\s*([\d.]+)\s*%/i, "지방"],
      [/지방\s*([\d.]+)\s*%/i, "지방"],
      [/조?섬유\s*([\d.]+)\s*%/i, "조섬유"],
      [/조?회분\s*([\d.]+)\s*%/i, "조회분"],
    ];
    for (const [re, label] of map) {
      const m = text.match(re);
      if (m) parts.push(`${label} ${m[1]}%`);
    }
    if (parts.length) return parts.join(", ");
  }

  if (technology === "wet" && servingG) {
    const g = Number(servingG);
    const parts = [];
    for (const [re, label] of [
      [/단백질\s*([\d.]+)\s*g/i, "단백질"],
      [/지방\s*([\d.]+)\s*g/i, "지방"],
      [/조섬유\s*([\d.]+)\s*g/i, "조섬유"],
      [/식이섬유\s*([\d.]+)\s*g/i, "식이섬유"],
    ]) {
      const m = text.match(re);
      if (m) {
        const pct = ((Number(m[1]) / g) * 100).toFixed(1);
        parts.push(`${label} ${pct}%`);
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

function getNutrition(r) {
  const analyt =
    r.nutritionalInfo?.find((n) =>
      n.title?.includes("analytical"),
    )?.description ??
    r.original_product?.composition?.find((c) => c.analytical_constituants)
      ?.analytical_constituants ??
    "";
  const servingG =
    r.original_product?.packs?.[0]?.weight_in_grams ??
    r.packs?.[0]?.size?.match(/(\d+)\s*g/)?.[1];
  return formatAnalytical(analyt, r.technology, servingG);
}

function getKcal(r) {
  const op = r.original_product ?? {};
  const servingG = op.packs?.[0]?.weight_in_grams;
  const analyt =
    r.nutritionalInfo?.find((n) =>
      n.title?.includes("analytical"),
    )?.description ?? "";
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

  const s = JSON.stringify(op);
  const per100 = s.match(/([\d.]+)\s*kcal per 100g/i)?.[1];
  if (per100) return Math.round(Number(per100) * 10) / 10;

  return null;
}

async function scrapeOne(item) {
  const base = item.locale === "uk" ? LOCALE_FALLBACK : BASE;
  const url = `${base}/${item.slug}`;
  const html = await fetchHtml(url);
  const r = parseResponse(html);
  if (!r) throw new Error(`no product data ${item.slug}`);

  return {
    id: item.id,
    slug: item.slug,
    url,
    title: r.title,
    technology: r.technology,
    ingredients: getIngredients(r),
    nutrition: getNutrition(r),
    kcalPer100g: getKcal(r),
    servingG:
      r.technology === "wet"
        ? r.original_product?.packs?.[0]?.weight_in_grams ?? 85
        : null,
  };
}

const results = [];
for (const item of PRODUCTS) {
  try {
    const p = await scrapeOne(item);
    results.push(p);
    console.log(
      "OK",
      item.id,
      p.title,
      p.ingredients ? "ing" : "---",
      p.nutrition ? "nut" : "---",
      p.kcalPer100g ?? "-",
    );
  } catch (e) {
    console.error("FAIL", item.id, item.slug, e.message);
    results.push({ id: item.id, slug: item.slug, error: e.message });
  }
  await sleep(2200);
}

const out = join(process.cwd(), "scripts", "rc-vet-scraped.json");
writeFileSync(out, JSON.stringify(results, null, 2));
console.log("Wrote", out, results.length, "products");
