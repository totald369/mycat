/**
 * 어바웃펫 상품 상세 API 메타 수집
 * Usage: node scripts/scrape-aboutpet.mjs [goodsId ...]
 */
import { writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";

const OUT = join(process.cwd(), "scripts", "aboutpet-api-meta.json");
const DEFAULT_IDS = [
  "GP251100269",
  "GP251028762",
  "GP251028759",
  "GP251028766",
  "GS251136481",
  "GS251136480",
  "GS251018666",
  "GP251025416",
  "GS251018660",
  "GS251017614",
];

async function fetchDesc(goodsId) {
  const r = await fetch("https://aboutpet.co.kr/goods/getGoodsDesc", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Mozilla/5.0",
      Referer: `https://aboutpet.co.kr/goods/indexGoodsDetail?goodsId=${goodsId}`,
      "X-Requested-With": "XMLHttpRequest",
    },
    body: `goodsId=${goodsId}`,
  });
  return r.json();
}

function extractImages(html) {
  if (!html) return [];
  return [
    ...new Set(
      [...html.matchAll(/src=\"([^\"]+\.(?:jpg|jpeg|png))\"/gi)].map((m) => m[1]),
    ),
  ];
}

async function main() {
  const ids = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_IDS;
  const items = [];
  for (const goodsId of ids) {
    const j = await fetchDesc(goodsId);
    const d = j?.goodsDesc;
    items.push({
      goodsId,
      goodsName: d?.goodsNm ?? null,
      detailImages: extractImages(d?.contentPc ?? d?.contentMobile ?? ""),
      url: `https://aboutpet.co.kr/goods/indexGoodsDetail?goodsId=${goodsId}`,
    });
    await new Promise((r) => setTimeout(r, 150));
  }
  writeFileSync(
    OUT,
    JSON.stringify(
      {
        source: "https://aboutpet.co.kr",
        scrapedAt: new Date().toISOString(),
        count: items.length,
        items,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`Wrote ${items.length} items → ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
