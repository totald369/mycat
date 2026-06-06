/**
 * catsrang-legacy-scraped.json → prisma/cat_food.csv 캐츠랑 레거시 보강
 * Usage: node scripts/apply-catsrang-legacy-csv.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CSV_PATH = join(process.cwd(), "prisma", "cat_food.csv");
const legacy = JSON.parse(
  readFileSync(join(process.cwd(), "scripts", "catsrang-legacy-scraped.json"), "utf8"),
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

const csvById = {};
for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;
  const cells = parseCsvLine(line);
  csvById[cells[idI]] = cells;
}

const byId = {};
for (const item of legacy) {
  if (item.copyFrom && csvById[item.copyFrom]) {
    const src = csvById[item.copyFrom];
    byId[item.id] = {
      ingredients: src[ingI],
      nutrition: src[nutI],
      kcalPer100g: item.kcalPer100g ?? (src[kcalI] ? Number(src[kcalI]) : null),
    };
  } else {
    byId[item.id] = {
      ingredients: item.ingredients,
      nutrition: item.nutrition,
      kcalPer100g: item.kcalPer100g,
    };
  }
}

let updated = 0;
const out = [header];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;
  const cells = parseCsvLine(line);
  const p = byId[cells[idI]];
  if (p && cells[brandI] === "캐츠랑") {
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

writeFileSync(CSV_PATH, out.join("\n") + "\n");
console.log(`Updated ${updated} Catsrang legacy rows in ${CSV_PATH}`);
