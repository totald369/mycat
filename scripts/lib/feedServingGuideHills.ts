import type { CsvFeedRow } from "./feedServingGuideCsv";

function normalizeMatchKey(text: string): string {
  return text
    .toLowerCase()
    .replace(/&amp;/g, "&")
    .replace(/[\s_\-/·•+,]+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

/** hillspet.co.kr 스크래핑 title(정규화) → CSV id */
export const HILLS_TITLE_FEED_ID: Record<string, string> = {
  키튼치킨: "HP1584-KTN-ORG",
  키튼센서티브스토막스킨연어현미: "HP1584-KTN-SENS-SAL",
  어덜트치킨: "HP2000-ADT-CHK",
  어덜트퍼펙트웨이트치킨: "HP6800-ADT-PW",
  어덜트인도어치킨: "HP1584-ADT-IND",
  어덜트헤어볼컨트롤치킨: "HP1584-ADT-HB",
  어덜트헤어볼컨트롤라이트치킨: "HP1584-ADT-HB-LGT",
  어덜트퍼펙트다이제스천: "HP1584-ADT-PD",
  어덜트퍼펙트다이제스천연어: "HP1584-ADT-PD-SAL",
  유리너리헤어볼컨트롤치킨라이스: "HP1584-ADT-UR-HB",
  어덜트7퍼펙트다이제스천: "HP1584-SNR7-PD",
  어덜트7헤어볼컨트롤치킨: "HP1584-SNR7-HB",
  어덜트7인도어치킨: "HP1584-SNR7-IND",
  어덜트11치킨: "HP1584-SNR11-CHK",
  어덜트연어현미: "HP1584-ADT-SAL-BR",
  어덜트유리너리헤어볼컨트롤: "HP-WET-UR-HB",
  키튼헬시퀴진치킨쌀: "HP-WET-HC-KTN-CHK",
  어덜트헬시퀴진치킨쌀: "HP-WET-HC-ADT-CHK",
  어덜트헬시퀴진참치당근: "HP-WET-HC-ADT-TUNA",
  id키튼: "HP-WET-ID-KTN",
  kd얼리서포트: "HP1810-KD-EARLY",
  kd야채튜나스튜: "HP-WET-KD-TUNA",
  onc케어: "HP1500-ONC",
  id: "HP1810-ID-DIG",
  kd: "HP1810-KD-CHK",
  kd오션피쉬: "HP1810-KD-FISH",
  cd멀티케어: "HP1500-CD-UR",
  cd멀티케어스트레스: "HP1500-CD-STRESS",
  cd멀티케어메타볼릭: "HP2880-CD-META",
  gi바이옴스트레스: "HP1810-GI-STRESS",
  td: "HP1500-TD",
  wd멀티베네핏: "HP1500-WD",
  zd: "HP1810-ZD",
  yd: "HP1810-YD",
  메타볼릭: "HP1500-META",
};

/** 레거시 id → 동일 제품 HP SKU (급여 가이드 복사) */
export const HILLS_LEGACY_GUIDE_SOURCE: Record<string, string> = {
  "11": "HP1584-KTN-ORG",
  "12": "HP2000-ADT-CHK",
  "14": "HP6800-ADT-PW",
  "15": "HP1584-ADT-IND",
  "63": "HP1810-ID-DIG",
  "65": "HP1500-CD-UR",
  "72": "HP1810-GI-BIOME",
  "61": "HP1810-KD-CHK",
  "67": "HP1810-ZD",
  "69": "HP1500-WD",
  "70": "HP1500-TD",
  "16": "HP1584-ADT-HB",
  "17": "HP1584-KTN-SENS-SAL",
  "13": "HP1584-SNR7-IND",
};

export function normalizeHillsTitle(title: string): string {
  return normalizeMatchKey(
    title
      .replace(/&amp;/g, "&")
      .replace(/\|[^|]*$/g, "")
      .replace(/힐스\s*프리스크립션\s*다이어트/gi, "")
      .replace(/사이언스\s*다이어트/gi, "")
      .replace(/힐스/gi, "")
      .replace(/\d+(?:\.\d+)?\s*kg/gi, "")
      .replace(/레시피/gi, "")
      .replace(/반려묘용/gi, "")
      .replace(/건사료|건식사료/gi, "")
      .replace(/사료/gi, "")
      .replace(/\(치킨[^)]*\)/gi, "")
      .replace(/플레이버/gi, "")
      .replace(/,\s*/g, "")
      .replace(/\+/g, "")
      .replace(/&/g, "")
      .trim(),
  );
}

export function normalizeHillsCsvName(name: string): string {
  return normalizeMatchKey(
    name
      .replace(/\d+(?:\.\d+)?\s*kg/gi, "")
      .replace(/레시피/gi, "")
      .trim(),
  );
}

export function resolveHillsFeedId(
  rows: CsvFeedRow[],
  hillsTitle: string,
): CsvFeedRow | null {
  const titleNorm = normalizeHillsTitle(hillsTitle);
  const mappedId = HILLS_TITLE_FEED_ID[titleNorm];
  if (mappedId) {
    const byId = rows.find((r) => r.id === mappedId);
    if (byId) return byId;
  }
  return null;
}

export function propagateHillsLegacyGuides(rows: CsvFeedRow[]): number {
  const byId = new Map(rows.map((r) => [r.id, r]));
  let updated = 0;

  for (const [targetId, sourceId] of Object.entries(HILLS_LEGACY_GUIDE_SOURCE)) {
    const target = byId.get(targetId);
    const source = byId.get(sourceId);
    if (!target || !source || target.type !== "dry") continue;
    if (target.guideDailyG.trim() !== "") continue;
    if (!source.guideDailyG.trim() || !source.guideWeightKg.trim()) continue;

    target.guideDailyG = source.guideDailyG;
    target.guideWeightKg = source.guideWeightKg;
    updated++;
  }

  return updated;
}
