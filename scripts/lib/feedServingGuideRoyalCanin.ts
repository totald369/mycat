/**
 * 로얄캐닌 retail 건식 — probe로 확인한 slug 목록 + CSV feedId 매핑
 */

/** curated retail 슬러그 (건식만, cat_food.csv 대상) */
export const RC_RETAIL_SLUGS: string[] = [
  "mother-&-babycat-2544",
  "kitten-2522",
  "kitten-spayed--neutered-2562",
  "sterilised-37-2537",
  "indoor-adult-2529",
  "hairball-care-2534",
  "urinary-care-1800",
  "weight-care-2524",
  "digestive-care-2555",
  "dental-care-2532",
  "hair&skin-care-2526",
  "indoor-7+-2548",
  "indoor-long-hair-usa-only-2549",
  "aging-11+-2561",
  "ageing-15+-8075",
  "british-shorthair-aging-11+-2561",
  "british-shorthair--adult-2557",
  "fit-and-active-2520",
  "fussy-2531",
  "savour-exigent-33-2531",
  "aroma-exigent-2543",
  "protein-exigent-2542",
  "sensitive-digestion-2521",
  "persian-adult-2552",
  "persian-kitten-2554",
  "ragdoll-adult-2515",
  "siamese-adult-2551",
  "bengal-adult-4370",
];

/** slug → cat_food.csv id (이름 매칭이 unreliable한 경우) */
export const RC_SLUG_FEED_ID: Record<string, string> = {
  "mother-&-babycat-2544": "01tdJ000002FJKXQA4",
  "kitten-2522": "01tdJ000002FJKZQA4",
  "kitten-spayed--neutered-2562": "01tdJ000002FJKbQAO",
  "sterilised-37-2537": "01tdJ000002FJLyQAO",
  "indoor-adult-2529": "01tdJ000002FJKcQAO",
  "hairball-care-2534": "01tdJ000002FJKtQAO",
  "urinary-care-1800": "01tdJ000002FJKvQAO",
  "weight-care-2524": "01tdJ000002FJKxQAO",
  "digestive-care-2555": "01tdJ000002FJKzQAO",
  "dental-care-2532": "01tdJ000002FJL0QAO",
  "hair&skin-care-2526": "01tdJ000002FJL1QAO",
  "indoor-7+-2548": "01tdJ000002FJKoQAO",
  "indoor-long-hair-usa-only-2549": "01tdJ000002FJKfQAO",
  "aging-11+-2561": "01tdJ000003UyOQQA0",
  "ageing-15+-8075": "01tdJ000003UzCPQA0",
  "aging-15+-8075": "01tdJ000003UzCPQA0",
  "british-shorthair-aging-11+-2561": "01tdJ000002FJL4QAO",
  "british-shorthair--adult-2557": "01tdJ000002FJL7QAO",
  "british-shorthair-adult-2557": "01tdJ000002FJL7QAO",
  "fit-and-active-2520": "01tdJ000002FJKhQAO",
  "fit-32-2520": "01tdJ000002FJKhQAO",
  "fussy-2531": "01tdJ000002FJKiQAO",
  "savour-exigent-2531": "01tdJ000002FJKiQAO",
  "savour-exigent-33-2531": "01tdJ000002FJKiQAO",
  "aroma-exigent-2543": "01tdJ000002FJKjQAO",
  "protein-exigent-2542": "01tdJ000002FJKkQAO",
  "sensitive-digestion-2521": "01tdJ000002FJKgQAO",
  "persian-adult-2552": "01tdJ000002FJL3QAO",
  "persian-kitten-2554": "01tdJ000002FJL2QAO",
  "ragdoll-adult-2515": "01tdJ000002FJL5QAO",
  "siamese-adult-2551": "01tdJ000002FJL8QAO",
  "bengal-adult-4370": "01tdJ000002FJL6QAO",
};

/** 공식 페이지 제목 → feedId (slug만으로는 구분 안 되는 경우) */
export const RC_TITLE_FEED_ID: Record<string, string> = {
  fussy: "01tdJ000002FJKiQAO",
  savourexigent: "01tdJ000002FJKiQAO",
  aromaexigent: "01tdJ000002FJKjQAO",
  proteinexigent: "01tdJ000002FJKkQAO",
  fit32: "01tdJ000002FJKhQAO",
  fitandactive: "01tdJ000002FJKhQAO",
  lightweightcare: "01tdJ000002FJKxQAO",
  sensible33: "01tdJ000002FJKgQAO",
  sterilised37: "01tdJ000002FJLyQAO",
  sterilised: "01tdJ000002FJLyQAO",
  ageing15: "01tdJ000003UzCPQA0",
  aging15: "01tdJ000003UzCPQA0",
  britishshorthairadult: "01tdJ000002FJL7QAO",
  kitten: "01tdJ000002FJKZQA4",
  kittensterilised: "01tdJ000002FJKbQAO",
  motherbabycat: "01tdJ000002FJKXQA4",
  persiankitten: "01tdJ000002FJL2QAO",
};

const WET_SLUG_HINT =
  /gravy|morsel|pouch|loaf|sauce|wet|in-gravy|in-sauce|mousse|canned|thin-slices|chunks|pate|pâté|ultra-soft/i;

export function isRcWetSlug(slug: string): boolean {
  return WET_SLUG_HINT.test(slug);
}

export function normalizeRcSlug(raw: string): string {
  return decodeURIComponent(raw).replace(/\/\d+$/, "");
}
