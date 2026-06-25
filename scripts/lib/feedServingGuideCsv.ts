import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export type CsvFeedRow = {
  id: string;
  brand: string;
  name: string;
  type: string;
  lifeStage: string;
  kcalPer100g: string;
  servingG: string;
  guideDailyG: string;
  guideWeightKg: string;
  category: string;
  condition: string;
  ingredients: string;
  nutritionAnalysis: string;
};

const COLUMNS = [
  "id",
  "brand",
  "name",
  "type",
  "life_stage",
  "kcal_per_100g",
  "serving_g",
  "guide_daily_g",
  "guide_weight_kg",
  "category",
  "condition",
  "ingredients",
  "nutrition_analysis",
] as const;

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
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

function escapeCell(cell: string): string {
  if (/[",\n\r]/.test(cell)) {
    return `"${cell.replace(/"/g, '""')}"`;
  }
  return cell;
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, "_");
}

export function loadCatFoodCsv(
  csvPath = join(process.cwd(), "prisma", "cat_food.csv"),
): CsvFeedRow[] {
  const raw = readFileSync(csvPath, "utf-8").replace(/^\uFEFF/, "");
  const rows = parseCsv(raw);
  const header = rows[0].map(normalizeHeader);
  const idx = (name: string) => header.indexOf(name);

  const out: CsvFeedRow[] = [];
  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    if (cells.every((c) => !c.trim())) continue;
    const get = (col: string) => {
      const i = idx(col);
      return i >= 0 ? (cells[i] ?? "").trim() : "";
    };
    out.push({
      id: get("id"),
      brand: get("brand"),
      name: get("name"),
      type: get("type"),
      lifeStage: get("life_stage"),
      kcalPer100g: get("kcal_per_100g"),
      servingG: get("serving_g"),
      guideDailyG: get("guide_daily_g"),
      guideWeightKg: get("guide_weight_kg"),
      category: get("category"),
      ingredients: get("ingredients"),
      nutritionAnalysis: get("nutrition_analysis"),
      condition: get("condition"),
    });
  }
  return out;
}

export function writeCatFoodCsv(
  feedRows: CsvFeedRow[],
  csvPath = join(process.cwd(), "prisma", "cat_food.csv"),
): void {
  const lines = [
    COLUMNS.join(","),
    ...feedRows.map((row) =>
      [
        row.id,
        row.brand,
        row.name,
        row.type,
        row.lifeStage,
        row.kcalPer100g,
        row.servingG,
        row.guideDailyG,
        row.guideWeightKg,
        row.category,
        row.condition,
        row.ingredients,
        row.nutritionAnalysis,
      ]
        .map(escapeCell)
        .join(","),
    ),
  ];
  writeFileSync(csvPath, `${lines.join("\n")}\n`, "utf-8");
}

export function resolveCsvPath(): string {
  const inPrisma = join(process.cwd(), "prisma", "cat_food.csv");
  const inRoot = join(process.cwd(), "cat_food.csv");
  if (existsSync(inPrisma)) return inPrisma;
  if (existsSync(inRoot)) return inRoot;
  return inPrisma;
}
