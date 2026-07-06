#!/usr/bin/env npx tsx
/** prisma/cat_food.csv → src/generated/cat_food.csv (Vercel 서버리스 번들 포함 보장) */
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = process.cwd();
const SOURCE = join(ROOT, "prisma", "cat_food.csv");
const DEST = join(ROOT, "src", "generated", "cat_food.csv");

function main() {
  if (!existsSync(SOURCE)) {
    console.warn("cat_food.csv sync skipped: prisma/cat_food.csv not found");
    return;
  }

  mkdirSync(dirname(DEST), { recursive: true });
  copyFileSync(SOURCE, DEST);
  console.log("src/generated/cat_food.csv synced from prisma/cat_food.csv");
}

main();
