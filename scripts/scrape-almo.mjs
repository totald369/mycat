/**
 * almonature.com 알모네이처 고양이 사료 상세 스크래핑
 * Usage: node scripts/scrape-almo.mjs
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

/** csv id → { code, locale } */
const PRODUCTS = [
  { id: "45", code: "5020h", locale: "en" },
  { id: "46", code: "5022h", locale: "en" },
  { id: "47", code: "5825", locale: "en" },
  { id: "48", code: "153", locale: "en" },
  { id: "49", code: "143", locale: "en" },
  { id: "50", code: "704", locale: "en" },
  { id: "120", code: "5812", locale: "en" },
  { id: "121", code: "5810", locale: "en" },
  { id: "122", code: "9134", locale: "en" },
  { id: "123", code: "9132", locale: "en" },
  { id: "124", code: "812", locale: "en" },
  { id: "125", code: "5434h", locale: "en" },
  { id: "126", code: "801", locale: "en" },
  { id: "127", code: "5274", locale: "en" },
  { id: "128", code: "1012h", locale: "en-us" },
  { id: "129", code: "5825", locale: "en" },
  { id: "130", code: "165", locale: "en" },
  { id: "131", code: "167", locale: "en" },
];

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

function parseGa(html) {
  const ga = {};
  for (const m of html.matchAll(
    /<li>\s*<span>([^<]+)<\/span>\s*<span>([^<]+)<\/span>/g,
  )) {
    ga[m[1].trim()] = m[2].trim().replace(",", ".");
  }
  const block = html.match(
    /Crude Protein \(min\)\s*([\d.]+)%[\s\S]{0,200}/i,
  );
  if (block) {
    const text = block[0];
    const pick = (label) =>
      text.match(new RegExp(`${label} \\(min\\)\\s*([\\d.]+)%`, "i"))?.[1] ||
      text.match(new RegExp(`${label} \\(max\\)\\s*([\\d.]+)%`, "i"))?.[1];
    ga["Crude Protein"] = ga["Crude Protein"] || pick("Crude Protein");
    ga["Crude Fat"] = ga["Crude Fat"] || pick("Crude Fat");
    ga["Crude Fibre"] = ga["Crude Fibre"] || pick("Crude Fiber");
    ga["Moisture"] = ga["Moisture"] || pick("Moisture");
    ga["Crude Ash"] = ga["Crude Ash"] || pick("Ash");
  }
  return ga;
}

function formatNutrition(ga, kcalKg) {
  const parts = [];
  const map = [
    ["Crude Protein", "단백질"],
    ["Crude Fat", "지방"],
    ["Crude Fibre", "조섬유"],
    ["Crude Fiber", "조섬유"],
    ["Moisture", "수분"],
    ["Crude Ash", "조회분"],
    ["Calcium", "칼슘"],
    ["Phosphorus", "인"],
    ["Magnesium", "마그네슘"],
  ];
  for (const [en, ko] of map) {
    if (ga[en]) parts.push(`${ko} ${ga[en]}`);
  }
  if (kcalKg) parts.push(`ME ${kcalKg} kcal/kg`);
  return parts.join(", ");
}

function parseIngredients(html) {
  for (const m of html.matchAll(
    /class="Product__ingredients[^"]*"[^>]*>([\s\S]*?)<\/div>/g,
  )) {
    const text = m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (text && !/^Ingredients Analytical/i.test(text)) return text;
  }
  return "";
}

function parseProduct({ id, code, locale }, html) {
  const ga = parseGa(html);
  const kcalKg =
    ga["Energy"]?.replace(/[^\d]/g, "") ||
    html.match(/Energy\s*(\d+)\s*kcal\/kg/i)?.[1] ||
    null;
  const kcalNum = kcalKg ? +String(kcalKg).replace(/\D/g, "") : null;
  return {
    id,
    code,
    locale,
    url: `https://www.almonature.com/${locale}/cat-products/${code}`,
    ingredients: parseIngredients(html),
    nutrition: formatNutrition(ga, kcalNum),
    kcalPer100g: kcalNum ? Math.round(kcalNum / 10) : null,
  };
}

async function main() {
  const results = [];
  for (const p of PRODUCTS) {
    try {
      await new Promise((r) => setTimeout(r, 250));
      const url = `https://www.almonature.com/${p.locale}/cat-products/${p.code}`;
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      const parsed = parseProduct(p, html);
      if (!parsed.ingredients) throw new Error("no ingredients");
      results.push(parsed);
      console.error("OK", p.id, p.code, parsed.kcalPer100g, parsed.ingredients.slice(0, 50));
    } catch (e) {
      console.error("FAIL", p.id, p.code, e.message);
    }
  }
  const out = join(process.cwd(), "scripts", "almo-scraped.json");
  writeFileSync(out, JSON.stringify(results, null, 2), "utf8");
  console.error(`Wrote ${results.length} products to ${out}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
