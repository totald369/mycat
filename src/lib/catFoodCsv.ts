import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** `/api/feeds` 한 행과 동일한 형태 */
export type FeedCatalogItem = {
  id: string;
  apiId: string;
  brand: string;
  name: string;
  displayLabel: string;
  label: string;
  kcalPer100g: number;
  feedKind: string;
  servingGrams: number | null;
  category?: string | null;
  feedCondition?: string | null;
};

function resolveCsvPath(): string {
  const inPrisma = join(process.cwd(), "prisma", "cat_food.csv");
  const inRoot = join(process.cwd(), "cat_food.csv");
  if (existsSync(inPrisma)) return inPrisma;
  if (existsSync(inRoot)) return inRoot;
  return inPrisma;
}

/** RFC4180 수준: 쌍따옴표·쉼표 이스케이프 (seedCatFoodCsv.ts 와 동일) */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(cur);
      cur = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cur);
      cur = "";
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
    } else {
      cur += c;
    }
  }
  row.push(cur);
  if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  return rows;
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, "_");
}

function normalizeFeedKind(type: string): string {
  const t = type.trim().toLowerCase();
  if (t === "dry" || t === "건식") return "건식";
  if (t === "wet" || t === "습식") return "습식";
  const trimmed = type.trim();
  return trimmed || "기타";
}

function buildDisplayLabel(kind: string, brand: string, name: string): string {
  const mid = [brand, name]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  const core = `${kind}/${mid || "이름 없음"}`;
  return core.length > 400 ? `${core.slice(0, 397)}…` : core;
}

/**
 * DB 없이 `prisma/cat_food.csv`에서 칼로리가 있는 급여만 읽습니다.
 * (로컬 db:seed:csv 와 동일 데이터 소스)
 */
export function loadFeedCatalogFromCatFoodCsv(): FeedCatalogItem[] {
  const csvPath = resolveCsvPath();
  if (!existsSync(csvPath)) {
    return [];
  }

  const raw = readFileSync(csvPath, "utf-8");
  let rows = parseCsv(raw.replace(/^\uFEFF/, ""));
  while (
    rows.length > 0 &&
    normalizeHeader(rows[0][0] ?? "") !== "id"
  ) {
    rows = rows.slice(1);
  }
  if (rows.length < 2) {
    return [];
  }

  const headerCells = rows[0].map(normalizeHeader);
  const idx = (name: string) => headerCells.indexOf(name);

  const idI = idx("id");
  const brandI = idx("brand");
  const nameI = idx("name");
  const typeI = idx("type");
  const kcalI = idx("kcal_per_100g");
  if (idI < 0 || brandI < 0 || nameI < 0 || typeI < 0 || kcalI < 0) {
    return [];
  }

  const servingCol = (["serving_g", "can_grams"] as const)
    .map((k) => headerCells.indexOf(k))
    .find((i) => i >= 0) ?? -1;

  const categoryI = idx("category");
  const conditionI = idx("condition");

  const out: FeedCatalogItem[] = [];

  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    if (cells.every((c) => !c.trim())) continue;

    const apiId = (cells[idI] ?? "").trim();
    if (!apiId) continue;

    const brand = (cells[brandI] ?? "").trim();
    const name = (cells[nameI] ?? "").trim();
    if (!name) continue;

    const feedKind = normalizeFeedKind(cells[typeI] ?? "");
    const kcalRaw = (cells[kcalI] ?? "").trim();
    const kcalParsed = kcalRaw === "" ? NaN : Number.parseFloat(kcalRaw);
    const kcalPer100g = Number.isFinite(kcalParsed) ? kcalParsed : NaN;
    if (!Number.isFinite(kcalPer100g)) continue;

    let servingGrams: number | null = null;
    if (feedKind === "습식") {
      if (servingCol >= 0) {
        const sgRaw = (cells[servingCol] ?? "").trim();
        if (sgRaw !== "") {
          const sg = Number.parseFloat(sgRaw);
          servingGrams = Number.isFinite(sg) ? sg : null;
        }
      }
      if (servingGrams == null) {
        servingGrams = 85;
      }
    }

    const displayLabel = buildDisplayLabel(feedKind, brand, name);

    const category =
      categoryI >= 0 ? (cells[categoryI] ?? "").trim() || null : null;
    const feedCondition =
      conditionI >= 0 ? (cells[conditionI] ?? "").trim() || null : null;

    out.push({
      id: `csv-${apiId}`,
      apiId,
      brand,
      name,
      displayLabel,
      label: displayLabel,
      kcalPer100g,
      feedKind,
      servingGrams,
      category,
      feedCondition,
    });
  }

  out.sort((a, b) => a.displayLabel.localeCompare(b.displayLabel, "ko"));
  return out;
}
