#!/usr/bin/env npx tsx
/** prisma/cat_food.csv → src/generated/catFoodCatalog.ts (서버리스 번들 문자열 임베드) */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = process.cwd();
const SOURCE = join(ROOT, "prisma", "cat_food.csv");
const DEST = join(ROOT, "src", "generated", "catFoodCatalog.ts");

function main() {
  if (!existsSync(SOURCE)) {
    console.warn("cat_food.csv sync skipped: prisma/cat_food.csv not found");
    return;
  }

  const csv = readFileSync(SOURCE, "utf-8");
  mkdirSync(dirname(DEST), { recursive: true });
  writeFileSync(
    DEST,
    `/** 자동 생성 — scripts/sync-cat-food-catalog.ts */\nexport const CAT_FOOD_CSV = ${JSON.stringify(csv)};\n`,
    "utf-8",
  );
  const rows = csv.trim().split("\n").length - 1;
  console.log(`src/generated/catFoodCatalog.ts synced (${rows} feeds)`);
}

main();
