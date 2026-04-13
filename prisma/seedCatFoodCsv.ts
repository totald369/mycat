import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function resolveCsvPath(): string {
  const inPrisma = join(process.cwd(), "prisma", "cat_food.csv");
  const inRoot = join(process.cwd(), "cat_food.csv");
  if (existsSync(inPrisma)) return inPrisma;
  if (existsSync(inRoot)) return inRoot;
  return inPrisma;
}

/** RFC4180 수준: 쌍따옴표·쉼표 이스케이프 */
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

async function main() {
  const CSV_PATH = resolveCsvPath();
  if (!existsSync(CSV_PATH)) {
    throw new Error(
      `cat_food.csv를 찾을 수 없습니다. prisma/cat_food.csv 또는 프로젝트 루트 cat_food.csv 에 두세요.`,
    );
  }
  const raw = readFileSync(CSV_PATH, "utf-8");
  let rows = parseCsv(raw.replace(/^\uFEFF/, ""));
  while (
    rows.length > 0 &&
    normalizeHeader(rows[0][0] ?? "") !== "id"
  ) {
    rows = rows.slice(1);
  }
  if (rows.length < 2) {
    throw new Error(
      `${CSV_PATH}: 헤더 외 데이터 행이 없습니다. id,brand,name,type,life_stage,kcal_per_100g … 형식으로 채워 주세요.`,
    );
  }

  const headerCells = rows[0].map(normalizeHeader);
  const idx = (name: string) => {
    const i = headerCells.indexOf(name);
    if (i < 0) {
      throw new Error(
        `${CSV_PATH}: '${name}' 열이 없습니다. id,brand,name,type,life_stage,kcal_per_100g 를 사용해 주세요.`,
      );
    }
    return i;
  };

  const servingCol = (["serving_g", "can_grams"] as const)
    .map((k) => headerCells.indexOf(k))
    .find((i) => i >= 0) ?? -1;

  const categoryI = headerCells.indexOf("category");
  const conditionI = headerCells.indexOf("condition");

  const I = {
    id: idx("id"),
    brand: idx("brand"),
    name: idx("name"),
    type: idx("type"),
    life_stage: idx("life_stage"),
    kcal_per_100g: idx("kcal_per_100g"),
  };

  let n = 0;
  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    if (cells.every((c) => !c.trim())) continue;

    const apiId = (cells[I.id] ?? "").trim();
    if (!apiId) {
      console.warn(`행 ${r + 1}: id가 비어 있어 건너뜁니다.`);
      continue;
    }

    const brand = (cells[I.brand] ?? "").trim();
    const name = (cells[I.name] ?? "").trim();
    if (!name) {
      console.warn(`행 ${r + 1} (${apiId}): name이 비어 있어 건너뜁니다.`);
      continue;
    }

    const feedKind = normalizeFeedKind(cells[I.type] ?? "");
    const lifeStage = (cells[I.life_stage] ?? "").trim() || null;
    const kcalRaw = (cells[I.kcal_per_100g] ?? "").trim();
    const kcalParsed = kcalRaw === "" ? NaN : Number.parseFloat(kcalRaw);
    const kcalPer100g = Number.isFinite(kcalParsed) ? kcalParsed : null;

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

    await prisma.feedProduct.upsert({
      where: { apiId },
      create: {
        apiId,
        feedKind,
        brand: brand || null,
        name,
        nameKo: null,
        displayLabel,
        sourceUrl: null,
        lifeStage,
        kcalPer100g,
        servingGrams,
        category,
        feedCondition,
      },
      update: {
        feedKind,
        brand: brand || null,
        name,
        displayLabel,
        sourceUrl: null,
        lifeStage,
        kcalPer100g,
        servingGrams,
        category,
        feedCondition,
      },
    });
    n += 1;
  }

  console.log(`cat_food.csv에서 ${n}건을 FeedProduct에 반영했습니다.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
