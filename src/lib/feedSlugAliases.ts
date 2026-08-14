/** 잘못된·구 슬러그 / 레거시 csv id → 현재 canonical slug */
export const FEED_SLUG_ALIASES: Record<string, string> = {
  "babiboyak-adult-tuna":
    "harim-pet-food-grain-free-the-real-crunch-adult-tuna-kg-1kg",
  // 초기 숫자 id → Salesforce apiId 전환 전 로얄캐닌 1~10
  "csv-1": "royal-canin-mother-and-babycat",
  "csv-2": "royal-canin-kitten",
  "csv-3": "royal-canin-kitten-sterilized",
  "csv-4": "royal-canin-indoor",
  "csv-5": "royal-canin-sterilized",
  "csv-6": "royal-canin-hairball-care",
  "csv-7": "royal-canin-light-weight-care",
  "csv-8": "royal-canin-indoor-7-plus",
  "csv-9": "royal-canin-babycat-mousse",
  "csv-10": "royal-canin-sterilized-pouch",
};
