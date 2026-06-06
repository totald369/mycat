/**
 * rawznaturalpetfood.com RAWZ 고양이 사료 상세 스크래핑
 * Usage: node scripts/scrape-rawz.mjs
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = "https://rawznaturalpetfood.com/product";

/** csv id → product slug (미판매·동일 레시피 다른 용량은 slug 공유) */
const PRODUCTS = [
  { id: "30", slug: "96-chicken-chicken-liver-pate" },
  { id: "31", slug: "96-salmon-recipe-pate" },
  { id: "32", slug: "96-turkey-turkey-liver-pate" },
  { id: "33", slug: "96-duck-duck-liver-pate" },
  { id: "34", slug: "shredded-chicken-recipe" },
  { id: "35", slug: "shredded-tuna-salmon" },
  { id: "100", slug: "96-chicken-chicken-liver-pate" },
  { id: "101", slug: "96-turkey-turkey-liver-pate" },
  { id: "102", slug: "beef-and-beef-liver-cat-food" },
  { id: "103", slug: "96-salmon-recipe-pate" },
  { id: "104", slug: "shredded-chicken-recipe" },
  { id: "105", slug: "shredded-tuna-salmon" },
  { id: "106", slug: "shredded-tuna-salmon" },
  { id: "107", slug: "shredded-chicken-and-tuna-cat-food" },
  { id: "108", slug: "immune-support-chicken-chicken-liver-cat-food" },
  { id: "109", slug: "kitten-chicken-chicken-liver-cat-food" },
  { id: "110", slug: "chicken-green-mussels-pumpkin-senior-cat-food" },
];

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Referer: "https://rawznaturalpetfood.com/",
};

function parseGa(html) {
  const pick = (label) =>
    html.match(new RegExp(`${label}[^\\d]{0,30}([\\d.]+)%`, "i"))?.[1];
  return {
    protein: pick("CRUDE PROTEIN MIN"),
    fat: pick("CRUDE FAT MIN"),
    fiber: pick("CRUDE FIBER MAX"),
    moisture: pick("MOISTURE MAX"),
    magnesium: pick("MAGNESIUM MAX"),
    taurine: pick("TAURINE MIN"),
  };
}

function formatNutrition(ga, kcalKg) {
  const parts = [];
  if (ga.protein) parts.push(`단백질 ${ga.protein}%`);
  if (ga.fat) parts.push(`지방 ${ga.fat}%`);
  if (ga.fiber) parts.push(`조섬유 ${ga.fiber}%`);
  if (ga.moisture) parts.push(`수분 ${ga.moisture}%`);
  if (ga.magnesium) parts.push(`마그네슘 ${ga.magnesium}%`);
  if (ga.taurine) parts.push(`타우린 ${ga.taurine}%`);
  if (kcalKg) parts.push(`ME ${kcalKg} kcal/kg`);
  return parts.join(", ");
}

function parseProduct({ id, slug }, html) {
  const items = [
    ...html.matchAll(/<span class="ingredient-item">([^<]+)/g),
  ].map((m) => m[1].trim());
  const ga = parseGa(html);
  const kcalKg =
    html.match(/<strong>([\d,]+)<\/strong>\s*kcal\/kg/i)?.[1]?.replace(",", "") ||
    html.match(/(\d[\d,]*)\s*kcal\/kg/i)?.[1]?.replace(",", "") ||
    null;
  return {
    id,
    slug,
    url: `${BASE}/${slug}/`,
    ingredients: items.join(", "),
    nutrition: formatNutrition(ga, kcalKg ? +kcalKg : null),
    kcalPer100g: kcalKg ? Math.round(+kcalKg / 10) : null,
  };
}

async function main() {
  const bySlug = new Map();
  const results = [];

  for (const p of PRODUCTS) {
    try {
      if (!bySlug.has(p.slug)) {
        await new Promise((r) => setTimeout(r, 300));
        const res = await fetch(`${BASE}/${p.slug}/`, { headers });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const html = await res.text();
        bySlug.set(p.slug, parseProduct(p, html));
      }
      const parsed = { ...bySlug.get(p.slug), id: p.id };
      if (!parsed.ingredients) throw new Error("no ingredients");
      results.push(parsed);
      console.error("OK", p.id, p.slug, parsed.kcalPer100g);
    } catch (e) {
      console.error("FAIL", p.id, p.slug, e.message);
    }
  }

  const out = join(process.cwd(), "scripts", "rawz-scraped.json");
  writeFileSync(out, JSON.stringify(results, null, 2), "utf8");
  console.error(`Wrote ${results.length} rows to ${out}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
