#!/usr/bin/env npx tsx
/**
 * SEO 부스트 콘텐츠 일괄 생성 (OpenAI → DB → prisma/feedSeoBoost.json)
 *
 * Usage:
 *   OPENAI_API_KEY=... ADMIN_SECRET=... npx tsx scripts/generate-feed-seo-boost.ts
 *   npx tsx scripts/generate-feed-seo-boost.ts --force
 *   npx tsx scripts/generate-feed-seo-boost.ts --id=36,37
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { generateSeoBoostForPilot } from "../src/lib/feedSeoBoostService";

function loadDotEnv(): void {
  const path = join(process.cwd(), ".env");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadDotEnv();

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const idArg = args.find((a) => a.startsWith("--id="));
  const feedApiIds = idArg
    ? idArg
        .slice("--id=".length)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : undefined;

  console.log("SEO boost generation start…", { force, feedApiIds });

  const result = await generateSeoBoostForPilot({ force, feedApiIds });

  console.log(`\n성공 ${result.ok.length}건:`);
  for (const id of result.ok) console.log(`  ✓ ${id}`);

  if (result.failed.length) {
    console.log(`\n실패 ${result.failed.length}건:`);
    for (const f of result.failed) console.log(`  ✗ ${f.feedApiId}: ${f.error}`);
    process.exit(1);
  }

  console.log("\nprisma/feedSeoBoost.json 동기화 완료");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
