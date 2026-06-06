/**
 * 풀무원몰 고양이 주식(itemId=5736) API 메타 수집
 * Usage: node scripts/scrape-pulmuone.mjs
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const CATEGORY_ID = 5736;
const KNOWN_IDS = [
  43259, 39680, 39252, 39251, 39250, 38705, 38704, 38703,
  38377, 38376, 38367, 38361, 38356, 38354,
];
const OUT = join(process.cwd(), "scripts", "pulmuone-api-meta.json");

async function postForm(url, fields) {
  const body = new URLSearchParams(fields);
  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Mozilla/5.0",
      Referer: `https://shop.pulmuone.co.kr/shop/goodsList?itemId=${CATEGORY_ID}`,
    },
    body,
  });
  return r.json();
}

async function fetchDetail(ilGoodsId) {
  return postForm("https://shop.pulmuone.co.kr/goods/goods/getGoodsPageInfo", {
    ilGoodsId: String(ilGoodsId),
  });
}

function extractBosImages(html) {
  if (!html) return [];
  const re = /BOS\/il\/[^"'\s>]+\.(?:jpg|jpeg|png)/gi;
  return [...new Set((html.match(re) ?? []).map((p) => `https://s.pulmuone.app/${p}`))];
}

async function main() {
  const listRes = await postForm(
    "https://shop.pulmuone.co.kr/goods/search/getCategoryGoodsList",
    {
      itemId: String(CATEGORY_ID),
      page: "1",
      pageSize: "50",
      sortType: "SORT_TYPE.RECOMMEND",
    },
  );

  const goodsList =
    listRes?.data?.goodsList ??
    listRes?.data?.list ??
    listRes?.data?.goods ??
    [];

  const ids =
    goodsList.length > 0
      ? goodsList.map((g) => g.ilGoodsId ?? g.goodsId).filter(Boolean)
      : KNOWN_IDS;

  const items = [];
  for (const ilGoodsId of ids) {
    const detail = await fetchDetail(ilGoodsId);
    const d = detail?.data;
    if (!d) {
      items.push({ ilGoodsId, error: detail?.message ?? "no data" });
      continue;
    }
    const html = [d.basicDescription, d.detailDescription].filter(Boolean).join("\n");
    items.push({
      ilGoodsId: d.ilGoodsId,
      goodsName: d.goodsName,
      goodsDesc: d.goodsDesc,
      brandName: d.brandName,
      salePrice: d.salePrice,
      nutrition: d.nutrition ?? null,
      detailImages: extractBosImages(html),
      url: `https://shop.pulmuone.co.kr/shop/goodsDetail?ilGoodsId=${d.ilGoodsId}`,
    });
    await new Promise((r) => setTimeout(r, 150));
  }

  writeFileSync(
    OUT,
    JSON.stringify(
      {
        source: `https://shop.pulmuone.co.kr/shop/goodsList?itemId=${CATEGORY_ID}`,
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
