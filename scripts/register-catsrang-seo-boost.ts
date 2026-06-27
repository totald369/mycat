#!/usr/bin/env npx tsx
/**
 * 캐츠랑 브랜드 SEO 부스트 파일럿 등록 + OpenAI 생성
 * Usage: npx tsx scripts/register-catsrang-seo-boost.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { getAllFeedDetails } from "@/lib/feedDetail";
import {
  generateSeoBoostForPilot,
  savePilotFeedApiIds,
} from "@/lib/feedSeoBoostService";
import { loadFeedSeoBoostCache } from "@/lib/feedSeoBoostStore";

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

async function main() {
  loadDotEnv();

  const catsrangIds = getAllFeedDetails()
    .filter((f) => f.brand === "캐츠랑")
    .map((f) => f.apiId);

  if (catsrangIds.length === 0) {
    throw new Error("캐츠랑 사료를 찾을 수 없습니다.");
  }

  const cache = loadFeedSeoBoostCache();
  const merged = [...new Set([...cache.pilotFeedApiIds, ...catsrangIds])];

  console.log(`캐츠랑 ${catsrangIds.length}건 → 파일럿 합계 ${merged.length}건`);
  await savePilotFeedApiIds(merged);

  console.log("OpenAI SEO 부스트 생성 시작…");
  const result = await generateSeoBoostForPilot({
    force: true,
    feedApiIds: catsrangIds,
  });

  console.log(`\n성공 ${result.ok.length}건`);
  for (const id of result.ok) console.log(`  ✓ ${id}`);

  if (result.failed.length) {
    console.log(`\n실패 ${result.failed.length}건:`);
    for (const f of result.failed) console.log(`  ✗ ${f.feedApiId}: ${f.error}`);
    process.exit(1);
  }

  const updated = loadFeedSeoBoostCache();
  const openaiCount = catsrangIds.filter(
    (id) => updated.contents[id]?.source === "openai",
  ).length;
  console.log(`\n캐츠랑 OpenAI 적용: ${openaiCount}/${catsrangIds.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
