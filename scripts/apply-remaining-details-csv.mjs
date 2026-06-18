/**
 * remaining-details-scraped.json → prisma/cat_food.csv
 * 레거시 25건 원재료·등록성분 + kcal 오입력 3건 보강
 * Usage: node scripts/apply-remaining-details-csv.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CSV_PATH = join(process.cwd(), "prisma", "cat_food.csv");
const scraped = JSON.parse(
  readFileSync(join(process.cwd(), "scripts", "remaining-details-scraped.json"), "utf8"),
);
const byId = Object.fromEntries(scraped.filter((p) => p.id).map((p) => [p.id, p]));

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
const kcalI = cols.indexOf("kcal_per_100g");
const ingI = cols.indexOf("ingredients");
const nutI = cols.indexOf("nutrition_analysis");

let updated = 0;
const out = [header];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;
  const cells = parseCsvLine(line);
  const id = cells[idI];
  const p = byId[id];
  if (p) {
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
console.log(`Updated ${updated} rows in ${CSV_PATH}`);
