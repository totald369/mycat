/**
 * petfriends-scraped.json → prisma/cat_food.csv 펫프렌즈 SKU append
 * Usage: node scripts/apply-petfriends-csv.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CSV_PATH = join(process.cwd(), "prisma", "cat_food.csv");
const data = JSON.parse(
  readFileSync(
    join(process.cwd(), "scripts", "petfriends-scraped.json"),
    "utf8",
  ),
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

const existingIds = new Set();
for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;
  existingIds.add(parseCsvLine(line)[0]);
}

const newRows = [];
for (const p of data.products ?? []) {
  if (existingIds.has(p.id)) {
    console.error("SKIP existing", p.id);
    continue;
  }
  if (!p.ingredients && !p.nutrition) {
    console.error("SKIP no data", p.id);
    continue;
  }
  newRows.push(
    [
      p.id,
      p.brand,
      p.name,
      p.type ?? "dry",
      p.life_stage ?? "all_life_stage",
      p.kcalPer100g ?? "",
      p.serving_g ?? "",
      p.category ?? "general",
      p.condition ?? "none",
      p.ingredients ?? "",
      p.nutrition ?? "",
    ]
      .map(csvEscape)
      .join(","),
  );
  console.error("ADD", p.id, p.name);
}

if (!newRows.length) {
  console.log("No new rows to append.");
  process.exit(0);
}

writeFileSync(
  CSV_PATH,
  raw.replace(/\n?$/, "\n") + newRows.join("\n") + "\n",
);
console.log(`Appended ${newRows.length} new rows → ${CSV_PATH}`);
