#!/usr/bin/env npx tsx
/**
 * SEO 부스트 파일럿 대상 일괄 등록
 * Usage: npx tsx scripts/register-seo-boost-pilot.ts
 */
import { getAllFeedDetails } from "../src/lib/feedDetail";
import { savePilotFeedApiIds } from "../src/lib/feedSeoBoostService";

const GSC_AND_AVODERM_IDS = [
  "01tdJ000002FJKcQAO", // 로얄캐닌 인도어
  "01tdJ000002FJKfQAO", // 로얄캐닌 인도어 롱헤어
  "01tdJ000003UyOQQA0", // 로얄캐닌 에이징 11
  "HF2002-COD-ADT-1", // 하림 더리얼 대구 1kg
  "GI251027985", // 위스카스 헤어볼 3kg
  "HP1500-META", // 힐스 메타볼릭 1.5kg
  "GP251077033", // 아카나 패시피카
  "GP251025415", // 아보덤 참치&게살
  "GP251025414", // 아보덤 참치&치킨
  "GP251025416", // 아보덤 참치&새우
  "145", // 레오나르도 치킨&오리 캔
  "GP251048294", // 위스카스 테이스티믹스
];

async function main() {
  const feeds = getAllFeedDetails();
  const royalCaninIds = feeds
    .filter((f) => (f.brand ?? "").includes("로얄캐닌"))
    .map((f) => f.apiId);

  const feedApiIds = [...new Set([...GSC_AND_AVODERM_IDS, ...royalCaninIds])];

  console.log(`등록 대상: ${feedApiIds.length}건`);
  console.log(`  GSC+아보덤: ${GSC_AND_AVODERM_IDS.length}건`);
  console.log(`  로얄캐닌: ${royalCaninIds.length}건`);

  const saved = await savePilotFeedApiIds(feedApiIds);
  console.log(`\n저장 완료: ${saved.length}건 → prisma/feedSeoBoost.json 동기화됨`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
