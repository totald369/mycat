/**
 * hillspet.co.kr → scripts/hills-legacy-scraped.json (레거시 id 11–20, 61–72)
 * Usage: node scripts/scrape-hills-legacy.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const scraped = JSON.parse(
  readFileSync(join(process.cwd(), "scripts", "hills-scraped.json"), "utf8"),
);
const bySlug = Object.fromEntries(scraped.map((p) => [p.slug, p]));

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept-Language": "ko-KR,ko;q=0.9",
};

/** @type {Record<string, { slug?: string, ingredientsSlug?: string, copyFrom?: string, kcalFrom?: string, manualIngredients?: string }>} */
const LEGACY = {
  11: { slug: "science-diet-kitten-original-dry" },
  12: { slug: "science-diet-adult-original-dry" },
  13: { slug: "science-diet-mature-adult-7-perfect-digestion-dry" },
  14: { slug: "science-diet-adult-perfect-weight-dry" },
  15: { slug: "science-diet-adult-indoor-dry" },
  16: {
    slug: "science-diet-adult-hairball-dry",
    ingredientsSlug: "science-diet-mature-adult-hairball-dry",
  },
  17: {
    slug: "science-diet-adult-perfect-digestion-chicken-barley-whole-oats-recipe-dry",
  },
  18: { copyFrom: "HP-WET-PD-STEW" },
  19: {
    slug: "science-diet-adult-perfect-digestion-chicken-vegetable-rice-stew-canned",
  },
  20: { copyFrom: "HP-WET-CD-STRESS-TUNA" },
  61: { slug: "prescription-diet-kd-kidney-care-dry" },
  62: {
    copyFrom: "HP-WET-KD-STEW",
    slug: "prescription-diet-kd-chicken-kidney-care-canned",
  },
  63: { slug: "prescription-diet-id-digestive-care-dry" },
  64: { slug: "pd-id-feline-canned" },
  65: { slug: "prescription-diet-cd-multicare-chicken-urinary-care-dry" },
  66: {
    slug: "prescription-diet-cd-multicare-stress-chicken-vegetable-stew-urinary-care-canned",
    kcalFrom: "HP-WET-CD-STRESS-STEW",
  },
  67: { slug: "prescription-diet-zd-food-sensitivities-dry" },
  68: { slug: "pd-zd-feline-canned" },
  69: { slug: "prescription-diet-wd-glucose-management-dry" },
  70: { slug: "prescription-diet-td-dental-care-dry" },
  71: {
    slug: "pd-ad-canine-feline-canned",
    manualIngredients:
      "물,칠면조 내장,돼지간,닭고기,옥수수전분,돼지단백질격리,어유,탄산칼슘,닭간향,천연향료,삼인산나트륨,염화칼륨,제이인산칼슘,구아검,타우린,비타민,콜린염화물,구연산칼륨,산화마그네슘,미네랄,베타카로틴",
  },
  72: { copyFrom: "HP1810-GI-BIOME" },
};

function badIngredients(s) {
  return (
    !s ||
    s.length < 30 ||
    !s.includes(",") ||
    /^유용한|^반려동물을위한/.test(s)
  );
}

function stripTags(s) {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseProduct(url, html) {
  const slug = url.split("/cat-food/")[1];
  let ingredients = "";
  const ingAccordion = html.match(
    /cmp-accordion__title">성분<[\s\S]*?<div class="segment[^"]*">\s*([\s\S]*?)\s*<\/div>/,
  );
  if (ingAccordion) {
    const s = ingAccordion[1].replace(/<[^>]+>/g, "").replace(/\s+/g, "").trim();
    if (!badIngredients(s)) ingredients = s;
  }

  let kcalKg = null;
  let kcalCan = null;
  let servingG = null;
  const kcalKgM = html.match(/(\d{3,4})\s*kcal\/kg/i);
  if (kcalKgM) kcalKg = Number(kcalKgM[1]);
  const kcalCanM = html.match(
    /(\d{2,4}(?:\.\d+)?)\s*kcal\s*\/[^(\n<]*\(\s*(\d+)\s*g\s*\)/i,
  );
  if (kcalCanM) {
    kcalCan = Number(kcalCanM[1]);
    servingG = Number(kcalCanM[2]);
  }

  const nutrients = {};
  for (const label of [
    "단백질",
    "지방",
    "조섬유",
    "칼슘",
    "인",
    "마그네슘",
    "타우린",
  ]) {
    const re = new RegExp(
      `<td>\\s*${label}\\s*</td>\\s*<td>\\s*([\\d.]+)\\s*%`,
      "i",
    );
    const m = html.match(re);
    if (m) nutrients[label] = m[1] + "%";
  }

  const parts = [];
  for (const label of ["단백질", "지방", "조섬유", "칼슘", "인", "마그네슘", "타우린"]) {
    if (nutrients[label]) parts.push(`${label} ${nutrients[label]}`);
  }
  if (kcalKg) parts.push(`ME ${kcalKg} kcal/kg (건조물 기준)`);

  let kcalPer100g = null;
  if (kcalKg) kcalPer100g = Math.round(kcalKg / 10);
  else if (kcalCan && servingG)
    kcalPer100g = Math.round((kcalCan / servingG) * 100);

  return {
    url,
    slug,
    ingredients,
    kcalPer100g,
    nutrition: parts.join(", "),
  };
}

async function fetchSlug(slug) {
  const url = `https://www.hillspet.co.kr/cat-food/${slug}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${slug}`);
  return parseProduct(url, await res.text());
}

function fromScraped(slug, ingredientsSlug) {
  const p = bySlug[slug];
  if (!p) return null;
  let ingredients = p.ingredients;
  if (badIngredients(ingredients) && ingredientsSlug && bySlug[ingredientsSlug]) {
    ingredients = bySlug[ingredientsSlug].ingredients;
  }
  if (badIngredients(ingredients)) ingredients = "";
  return {
    url: p.url,
    slug,
    ingredients,
    kcalPer100g: p.kcalPer100g,
    nutrition: p.nutrition,
  };
}

function loadCsvCopy(ids) {
  const raw = readFileSync(join(process.cwd(), "prisma", "cat_food.csv"), "utf8");
  const cols = raw.split("\n")[0].split(",");
  const idI = cols.indexOf("id");
  const ingI = cols.indexOf("ingredients");
  const nutI = cols.indexOf("nutrition_analysis");
  const kcalI = cols.indexOf("kcal_per_100g");
  const out = {};
  for (const line of raw.split(/\r?\n/).slice(1)) {
    if (!line.trim()) continue;
    const cells = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (inQ) {
        if (c === '"' && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else if (c === '"') inQ = false;
        else cur += c;
      } else if (c === '"') inQ = true;
      else if (c === ",") {
        cells.push(cur);
        cur = "";
      } else cur += c;
    }
    cells.push(cur);
    if (ids.has(cells[idI])) {
      out[cells[idI]] = {
        ingredients: cells[ingI],
        nutrition: cells[nutI],
        kcalPer100g: cells[kcalI] ? Number(cells[kcalI]) : null,
      };
    }
  }
  return out;
}

async function main() {
  const copyIds = new Set(
    Object.values(LEGACY)
      .flatMap((m) => [m.copyFrom, m.kcalFrom].filter(Boolean)),
  );
  const csvCopy = loadCsvCopy(copyIds);
  const results = [];

  for (const [id, map] of Object.entries(LEGACY)) {
    let row = null;

    if (map.copyFrom && csvCopy[map.copyFrom]) {
      const c = csvCopy[map.copyFrom];
      row = {
        id,
        ingredients: c.ingredients,
        nutrition: c.nutrition,
        kcalPer100g: c.kcalPer100g,
        url: `copy:${map.copyFrom}`,
      };
      if (map.slug) {
        try {
          const fetched = await fetchSlug(map.slug);
          if (fetched.nutrition) row.nutrition = fetched.nutrition;
          if (fetched.kcalPer100g != null) row.kcalPer100g = fetched.kcalPer100g;
          row.url = fetched.url;
        } catch {
          const cached = fromScraped(map.slug);
          if (cached?.nutrition) row.nutrition = cached.nutrition;
        }
      }
    } else if (map.slug) {
      row = fromScraped(map.slug, map.ingredientsSlug);
      if (!row?.ingredients || badIngredients(row.ingredients)) {
        try {
          await new Promise((r) => setTimeout(r, 250));
          row = await fetchSlug(map.slug);
        } catch (e) {
          console.error("fetch fail", id, map.slug, e.message);
        }
      }
      if (row && map.ingredientsSlug && badIngredients(row.ingredients)) {
        const alt = bySlug[map.ingredientsSlug];
        if (alt?.ingredients) row.ingredients = alt.ingredients;
      }
      row = row ? { id, ...row } : null;
    }

    if (map.kcalFrom && csvCopy[map.kcalFrom]?.kcalPer100g != null && row) {
      row.kcalPer100g = csvCopy[map.kcalFrom].kcalPer100g;
    }

    if (map.manualIngredients && row) {
      row.ingredients = map.manualIngredients;
    }

    if (row?.ingredients && row?.nutrition) {
      results.push(row);
      console.error(id, row.kcalPer100g ?? "-", row.ingredients.slice(0, 24) + "...");
    } else {
      console.error("SKIP", id, row);
    }
  }

  const out = join(process.cwd(), "scripts", "hills-legacy-scraped.json");
  writeFileSync(out, JSON.stringify(results, null, 2), "utf8");
  console.error(`Wrote ${results.length} rows to ${out}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
