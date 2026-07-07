/**
 * apac.acana.com/ko-KR 고양이(cgid=cats) — 미등록 탐지 + 공식명·성분 동기화 + cat_food.csv
 * Usage: node scripts/register-acana-kr-missing.mjs [--dry-run]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DRY = process.argv.includes("--dry-run");
const CSV_PATH = join(process.cwd(), "prisma", "cat_food.csv");
const CATALOG_PATH = join(process.cwd(), "scripts", "acana-kr-catalog.json");
const OUT_JSON = join(process.cwd(), "scripts", "acana-kr-register-result.json");

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept-Language": "ko-KR,ko;q=0.9",
};

function normKey(s) {
  return String(s ?? "")
    .toLowerCase()
    .replace(/아카나|acana|highest\s*protein|하이프로틴/gi, "")
    .replace(/\d+(?:\.\d+)?\s*(?:kg|g)/g, "")
    .replace(/[\s_\-/·•+,()&]+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

function parseCsvRows(raw) {
  const lines = raw.split(/\r?\n/);
  const header = lines[0];
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const cols = [];
    let cur = "";
    let inQ = false;
    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      if (inQ) {
        if (ch === '"' && line[j + 1] === '"') {
          cur += '"';
          j++;
        } else if (ch === '"') inQ = false;
        else cur += ch;
      } else if (ch === '"') inQ = true;
      else if (ch === ",") {
        cols.push(cur);
        cur = "";
      } else cur += ch;
    }
    cols.push(cur);
    rows.push({ lineNo: i, cols, raw: line });
  }
  return { header, rows };
}

function csvEscape(s) {
  if (s == null || s === "") return "";
  if (/[",\n]/.test(s)) return `"${String(s).replace(/"/g, '""')}"`;
  return String(s);
}

function makeRow(spec) {
  return [
    spec.id,
    "아카나",
    spec.name,
    spec.type,
    spec.life_stage,
    spec.kcal_per_100g ?? "",
    spec.serving_g ?? "",
    spec.guide_daily_g ?? "",
    spec.guide_weight_kg ?? "",
    spec.category,
    spec.condition,
    spec.ingredients ?? "",
    spec.nutrition_analysis ?? "",
  ]
    .map(csvEscape)
    .join(",");
}

function buildAcanaIndex(rows) {
  const byId = new Map();
  const keys = new Set();
  for (const row of rows) {
    const [id, brand, name] = row.cols;
    if (brand !== "아카나") continue;
    byId.set(id, row);
    keys.add(normKey(name));
  }
  return { byId, keys };
}

function findExistingRow(spec, { byId, keys }) {
  if (byId.has(spec.id)) return byId.get(spec.id);
  const nk = normKey(spec.name);
  if (keys.has(nk)) {
    for (const row of byId.values()) {
      if (normKey(row.cols[2]) === nk) return row;
    }
  }
  for (const alias of spec.aliases ?? []) {
    const ak = normKey(alias);
    if (!keys.has(ak)) continue;
    for (const row of byId.values()) {
      if (normKey(row.cols[2]) === ak) return row;
    }
  }
  return null;
}

async function fetchOfficialSlugs() {
  const url = "https://apac.acana.com/ko-KR/search?cgid=cats";
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Acana search ${res.status}`);
  const html = await res.text();
  const slugs = [...html.matchAll(/data-pid="(ap-ns-aca-[^"]+)"/g)].map((m) => m[1]);
  return [...new Set(slugs)];
}

function updateRowCols(cols, spec) {
  cols[0] = spec.id;
  cols[1] = "아카나";
  cols[2] = spec.name;
  cols[3] = spec.type;
  cols[4] = spec.life_stage;
  cols[5] = String(spec.kcal_per_100g ?? cols[5] ?? "");
  cols[11] = spec.ingredients ?? cols[11] ?? "";
  cols[12] = spec.nutrition_analysis ?? cols[12] ?? "";
  return cols;
}

async function main() {
  const catalog = JSON.parse(readFileSync(CATALOG_PATH, "utf8"));
  const raw = readFileSync(CSV_PATH, "utf8");
  const { header, rows } = parseCsvRows(raw);

  let officialSlugs = [];
  try {
    officialSlugs = await fetchOfficialSlugs();
  } catch (e) {
    console.warn("Official slug fetch failed, using catalog only:", e.message);
    officialSlugs = catalog.map((c) => c.slug);
  }

  const catalogBySlug = new Map(catalog.map((c) => [c.slug, c]));
  const missingSlugs = officialSlugs.filter((s) => !catalogBySlug.has(s));
  if (missingSlugs.length) {
    console.warn("Unknown official slugs (add to acana-kr-catalog.json):", missingSlugs.join(", "));
  }

  const index = buildAcanaIndex(rows);
  const synced = [];
  const appended = [];
  const missing = [];

  for (const slug of officialSlugs) {
    const spec = catalogBySlug.get(slug);
    if (!spec) continue;

    const existing = findExistingRow(spec, index);
    if (existing) {
      const before = existing.cols[2];
      updateRowCols(existing.cols, spec);
      existing.raw = existing.cols.map(csvEscape).join(",");
      synced.push({ id: spec.id, from: before, to: spec.name });
      continue;
    }

    missing.push(spec);
    const rowStr = makeRow({ ...spec, id: spec.id || `ACA-KR-${slug}` });
    rows.push({ lineNo: rows.length + 1, raw: rowStr });
    appended.push(spec.name);
  }

  console.log(`Official: ${officialSlugs.length}, synced: ${synced.length}, missing: ${missing.length}`);
  for (const s of synced) console.log(`SYNC ${s.id} ${s.from} → ${s.to}`);
  for (const name of appended) console.log(`ADD ${name}`);

  const result = {
    official_count: officialSlugs.length,
    synced: synced.length,
    appended: appended.length,
    missing_slugs: missingSlugs,
    at: new Date().toISOString(),
  };

  if (!DRY && (synced.length || appended.length)) {
    const out = [header, ...rows.map((r) => r.raw)].join("\n") + "\n";
    writeFileSync(CSV_PATH, out, "utf8");
    console.log(`Updated ${CSV_PATH}`);
  } else if (DRY) {
    console.log("Dry run — no CSV write");
  } else {
    console.log("No CSV changes");
  }

  writeFileSync(OUT_JSON, JSON.stringify(result, null, 2));
  console.log(`Wrote ${OUT_JSON}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
