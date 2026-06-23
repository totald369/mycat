#!/usr/bin/env npx tsx
/**
 * SEO 부스트 콘텐츠 일괄 생성 (OpenAI → DB → prisma/feedSeoBoost.json)
 *
 * Usage:
 *   OPENAI_API_KEY=... ADMIN_SECRET=... npx tsx scripts/generate-feed-seo-boost.ts
 *   npx tsx scripts/generate-feed-seo-boost.ts --force
 *   npx tsx scripts/generate-feed-seo-boost.ts --id=36,37
 */
import { generateSeoBoostForPilot } from "../src/lib/feedSeoBoostService";

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
