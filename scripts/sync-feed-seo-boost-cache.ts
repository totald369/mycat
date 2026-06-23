#!/usr/bin/env npx tsx
/** DB의 SEO 부스트 콘텐츠 → prisma/feedSeoBoost.json (SSG 빌드용) */
import { syncCacheFromDb } from "../src/lib/feedSeoBoostService";

async function main() {
  try {
    await syncCacheFromDb();
    console.log("feedSeoBoost.json synced from DB");
  } catch (e) {
    console.warn(
      "SEO boost cache sync skipped:",
      e instanceof Error ? e.message : e,
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
