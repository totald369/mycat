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
  // 퓨리나 KR 명칭 정정 전 slug (원 캣 인도어 → 성묘용 실내고양이 등)
  "purina-indoor": "purina-kg-1-4kg-dry",
  "purina-kitten": "purina-kitten-kg-1-4kg",
  "purina-pouch-kitten": "purina-pouch-kitten-170g",
  "purina-fancy-feast-chicken": "purina-fancy-feast-chicken-85g-40",
  "purina-fancy-feast-tuna": "purina-fancy-feast-tuna-85g-41",
  "purina-fancy-feast-pate": "purina-fancy-feast-salmon-85g-wet",
  "purina-pate": "purina-chicken-pate-85g",
  "purina-shred": "purina-chicken-salmon-85g",
};
