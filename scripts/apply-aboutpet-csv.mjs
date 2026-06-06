/**
 * aboutpet-scraped.json → prisma/cat_food.csv 어바웃펫 SKU 보강·append
 * Usage: node scripts/apply-aboutpet-csv.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CSV_PATH = join(process.cwd(), "prisma", "cat_food.csv");
const data = JSON.parse(
  readFileSync(join(process.cwd(), "scripts", "aboutpet-scraped.json"), "utf8"),
);

function csvEscape(s) {
  const v = String(s ?? "");
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function parseCsvLine(line) {
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
  return cells;
}

const raw = readFileSync(CSV_PATH, "utf8");
const lines = raw.split(/\r?\n/);
const header = lines[0];
const cols = header.split(",");
const idI = cols.indexOf("id");
const brandI = cols.indexOf("brand");
const kcalI = cols.indexOf("kcal_per_100g");
const servingI = cols.indexOf("serving_g");
const ingI = cols.indexOf("ingredients");
const nutI = cols.indexOf("nutrition_analysis");

const existingIds = new Set();
for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;
  existingIds.add(parseCsvLine(line)[idI]);
}

const detailByKey = {};
for (const item of data.legacy ?? []) {
  detailByKey[item.id] = item;
}

function resolveProduct(p) {
  if (p.copyFrom && detailByKey[p.copyFrom]) {
    const src = detailByKey[p.copyFrom];
    return {
      ingredients: src.ingredients,
      nutrition: src.nutrition,
      kcalPer100g: p.kcalPer100g ?? src.kcalPer100g,
      serving_g: p.serving_g ?? src.serving_g,
    };
  }
  return {
    ingredients: p.ingredients,
    nutrition: p.nutrition,
    kcalPer100g: p.kcalPer100g,
    serving_g: p.serving_g,
  };
}

for (const p of data.products ?? []) {
  detailByKey[p.id] = resolveProduct(p);
}

let updated = 0;
const out = [header];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;
  const cells = parseCsvLine(line);
  const p = detailByKey[cells[idI]];
  if (p) {
    if (p.ingredients) {
      cells[ingI] = p.ingredients;
      updated++;
    }
    if (p.nutrition) cells[nutI] = p.nutrition;
    if (p.kcalPer100g != null && Number.isFinite(p.kcalPer100g)) {
      cells[kcalI] = String(p.kcalPer100g);
    }
    if (p.serving_g != null && servingI >= 0) {
      cells[servingI] = String(p.serving_g);
    }
  }
  out.push(cells.map(csvEscape).join(","));
}

const newRows = [];
for (const p of data.products ?? []) {
  if (existingIds.has(p.id)) continue;
  const d = resolveProduct(p);
  if (!d.ingredients && !d.nutrition) {
    console.error("SKIP no data", p.id);
    continue;
  }
  newRows.push(
    [
      p.id,
      p.brand,
      p.name,
      p.type ?? "dry",
      p.life_stage ?? "adult_1y_plus",
      d.kcalPer100g ?? "",
      d.serving_g ?? "",
      p.category ?? "general",
      p.condition ?? "none",
      d.ingredients ?? "",
      d.nutrition ?? "",
    ]
      .map(csvEscape)
      .join(","),
  );
  console.error("ADD", p.id, p.name);
}

writeFileSync(
  CSV_PATH,
  out.join("\n") + (newRows.length ? "\n" + newRows.join("\n") : "") + "\n",
);
console.log(
  `Updated ${updated} legacy rows, appended ${newRows.length} new rows → ${CSV_PATH}`,
);
