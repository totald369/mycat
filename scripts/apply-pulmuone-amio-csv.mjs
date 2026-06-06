/**
 * pulmuone-amio-scraped.json → prisma/cat_food.csv 아미오 레거시 보강 + 신규 SKU
 * Usage: node scripts/apply-pulmuone-amio-csv.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CSV_PATH = join(process.cwd(), "prisma", "cat_food.csv");
const data = JSON.parse(
  readFileSync(join(process.cwd(), "scripts", "pulmuone-amio-scraped.json"), "utf8"),
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
  detailByKey[item.id] = {
    ingredients: item.ingredients,
    nutrition: item.nutrition,
    kcalPer100g: item.kcalPer100g,
  };
}

function resolveProduct(p) {
  if (p.copyFrom && detailByKey[p.copyFrom]) {
    const src = detailByKey[p.copyFrom];
    return {
      ingredients: src.ingredients,
      nutrition: src.nutrition,
      kcalPer100g: p.kcalPer100g ?? src.kcalPer100g,
    };
  }
  return {
    ingredients: p.ingredients,
    nutrition: p.nutrition,
    kcalPer100g: p.kcalPer100g,
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
  if (p && cells[brandI] === "아미오") {
    if (p.ingredients) {
      cells[ingI] = p.ingredients;
      updated++;
    }
    if (p.nutrition) cells[nutI] = p.nutrition;
    if (p.kcalPer100g != null && Number.isFinite(p.kcalPer100g)) {
      cells[kcalI] = String(p.kcalPer100g);
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
      "아미오",
      p.name,
      p.type ?? "dry",
      p.life_stage ?? "adult_1y_plus",
      d.kcalPer100g ?? "",
      p.serving_g ?? "",
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
  `Updated ${updated} Amio legacy rows, appended ${newRows.length} new rows → ${CSV_PATH}`,
);
