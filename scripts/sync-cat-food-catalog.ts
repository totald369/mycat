#!/usr/bin/env npx tsx
/** prisma/cat_food.csv → src/generated/catFoodCatalog.json (서버리스 번들 포함) */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = process.cwd();
const SOURCE = join(ROOT, "prisma", "cat_food.csv");
const DEST = join(ROOT, "src", "generated", "catFoodCatalog.json");

function main() {
  if (!existsSync(SOURCE)) {
    console.warn("cat_food.csv sync skipped: prisma/cat_food.csv not found");
    return;
  }

  const csv = readFileSync(SOURCE, "utf-8");
  mkdirSync(dirname(DEST), { recursive: true });
  writeFileSync(
    DEST,
    JSON.stringify({ rowCount: csv.trim().split("\n").length - 1, csv }),
    "utf-8",
  );
  console.log(`src/generated/catFoodCatalog.json synced (${csv.trim().split("\n").length - 1} feeds)`);
}

main();
