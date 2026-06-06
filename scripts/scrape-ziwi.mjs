/**
 * us.ziwipets.com ZIWI Peak 고양이 사료 상세 스크래핑
 * Usage: node scripts/scrape-ziwi.mjs
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = "https://us.ziwipets.com/products";

/** csv id → Shopify slug */
const PRODUCTS = [
  { id: "90", slug: "air-dried-chicken-recipe-for-cats" },
  { id: "91", slug: "air-dried-beef-recipe-for-cats" },
  { id: "92", slug: "air-dried-lamb-recipe-for-cats" },
  { id: "93", slug: "air-dried-venison-recipe-for-cats" },
  { id: "94", slug: "air-dried-mackerel-and-lamb-cat-food" },
  { id: "95", slug: "wet-canned-chicken-for-cats" },
  { id: "96", slug: "wet-beef-cat-food" },
  { id: "97", slug: "wet-lamb-cat-food" },
  { id: "98", slug: "wet-canned-venison-cat-food" },
  { id: "99", slug: "canned-wet-mackerel-lamb-for-cats" },
];

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

function parseGa(html) {
  const ga = {};
  for (const m of html.matchAll(
    /<span>\s*(Crude [^<]+|Moisture|Ash|Taurine[^<]*)<\/span>[\s\S]*?<span>\s*\([^)]*\)\s*([^<]+)<\/span>/gi,
  )) {
    let key = m[1].trim();
    if (key.startsWith("Crude ")) key = key.slice(6);
    ga[key] = m[2].trim();
  }
  return ga;
}

function formatNutrition(ga, kcalKg) {
  const parts = [];
  const map = [
    ["Protein", "단백질"],
    ["Fat", "지방"],
    ["Fiber", "조섬유"],
    ["Moisture", "수분"],
    ["Ash", "조회분"],
    ["Taurine", "타우린"],
  ];
  for (const [en, ko] of map) {
    if (ga[en]) parts.push(`${ko} ${ga[en]}`);
  }
  if (kcalKg) parts.push(`ME ${kcalKg} kcal/kg`);
  return parts.join(", ");
}

function parseIngredients(html) {
  const candidates = [
    ...html.matchAll(/<div class="rte small-paragraph">[\s\S]*?<p>([^<]+)<\/p>/g),
  ]
    .map((m) => m[1].replace(/\s+/g, " ").trim())
    .filter((s) => s.length > 40 && s.includes(","));
  return candidates.sort((a, b) => b.length - a.length)[0] || "";
}

function parseProduct({ id, slug }, html) {
  const ing = parseIngredients(html);
  const ga = parseGa(html);
  const kcals = [...html.matchAll(/(\d{3,4})\s*kcal/gi)].map((m) => +m[1]);
  const kcalKg = kcals.filter((k) => k >= 1000).sort((a, b) => b - a)[0] ?? null;
  return {
    id,
    slug,
    url: `${BASE}/${slug}`,
    ingredients: ing,
    nutrition: formatNutrition(ga, kcalKg),
    kcalPer100g: kcalKg ? Math.round(kcalKg / 10) : null,
  };
}

async function main() {
  const results = [];
  for (const p of PRODUCTS) {
    try {
      await new Promise((r) => setTimeout(r, 250));
      const res = await fetch(`${BASE}/${p.slug}`, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      const parsed = parseProduct(p, html);
      if (!parsed.ingredients) throw new Error("no ingredients");
      results.push(parsed);
      console.error("OK", p.id, p.slug, parsed.kcalPer100g, parsed.ingredients.slice(0, 40));
    } catch (e) {
      console.error("FAIL", p.id, p.slug, e.message);
    }
  }
  const out = join(process.cwd(), "scripts", "ziwi-scraped.json");
  writeFileSync(out, JSON.stringify(results, null, 2), "utf8");
  console.error(`Wrote ${results.length} products to ${out}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
