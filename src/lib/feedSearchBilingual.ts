import { canonicalizeKoreanSearchSpelling } from "@/lib/koreanSearchNormalize";
import { safeString } from "@/lib/feedSafeValues";

/** 검색어·카탈로그 문자열 공통 compact (feedSearchNormalize와 동일 규칙) */
export function compactForBilingual(value: unknown): string {
  const s = safeString(value);
  if (!s) return "";
  return canonicalizeKoreanSearchSpelling(s)
    .normalize("NFC")
    .toLowerCase()
    .replace(/[\s\-_/·.,'’+]+/gu, "");
}

/**
 * 한글·영문 중 한쪽만 등록된 브랜드·제품명·처방 라인도 양방향 검색되도록 별칭 그룹.
 * 그룹 내 임의 항목이 입력에 부분 일치하면 같은 그룹 전체를 검색 토큰에 포함.
 */
const SEARCH_ALIAS_GROUPS: readonly (readonly string[])[] = [
  // 브랜드
  ["로얄캐닌", "royal canin", "royalcanin"],
  ["힐스", "hills", "hill's", "hillspet"],
  ["아카나", "acana"],
  ["로우즈", "rawz"],
  ["퓨리나", "purina"],
  ["알모네이처", "almo nature", "almonature"],
  ["오리젠", "orijen"],
  ["퍼시캣", "fussie cat", "fussiecat"],
  ["지위픽", "ziwi", "ziwipeak"],
  ["프린세스", "princess"],
  ["레오나르도", "leonardo"],
  ["캐츠랑", "catsrang"],
  ["쓰라이브", "thrive"],
  ["아미오", "amio"],
  ["아보덤", "avoderm"],
  ["웰니스", "wellness"],
  ["위스카스", "whiskas"],
  ["유한양행", "yuhan", "recipe v", "recipev"],
  ["이즈칸", "iskhan"],
  ["요세라", "josera"],
  ["카나간", "canagan"],
  ["뉴트로", "nutro"],
  ["뉴트리플랜", "nutriplan"],
  ["닥터힐메딕스", "healmedix", "hillmedix"],
  ["하림펫푸드", "harim", "harim pet"],
  ["밥이보약", "babiboyak"],
  ["퓨어네이쳐", "pure nature", "purenature"],
  ["세라피드", "serenity"],
  ["블랙우드", "blackwood"],
  ["보레알", "boreal"],
  ["브릿", "brit", "brit care"],
  ["게더", "gather"],
  ["쉬바", "sheba"],
  ["스텔라앤츄이스", "stella and chewy", "stella & chewy"],
  ["인디고", "indigo"],
  ["네이처스버라이어티", "nature's variety", "natures variety", "instinct"],
  ["now", "나우", "now fresh"],
  ["anf", "ANF"],
  ["summit", "SUMMIT"],
  ["cp클래식", "cp classic"],
  ["ca코리아", "ca korea"],
  ["데일리딜라이트", "daily delight"],
  ["케어캣", "carecat"],

  // 제품·라인 (한글명 / 영문명)
  ["원 캣", "one cat", "one"],
  ["팬시피스트", "fancy feast", "fancyfeast"],
  ["프로플랜", "pro plan", "proplan"],
  ["사이언스 다이어트", "science diet"],
  ["프리스크립션 다이어트", "prescription diet"],
  ["인도어", "indoor"],
  ["키튼", "kitten"],
  ["성묘", "어덜트", "adult"],
  ["시니어", "노령", "senior"],
  ["체중관리", "weight", "light", "weight control"],
  ["유리너리", "urinary"],
  ["헤어볼", "hairball"],
  ["다이제스티브", "digestive"],
  ["그레인프리", "grain free", "grainfree"],
  ["마더앤베이비캣", "mother and babycat", "mother & babycat"],
  ["스테럴라이즈드", "sterilised", "spayed", "neutered"],
  ["웨이트 컨트롤", "weight control"],
  ["인테스티날", "intestinal"],
  ["유리너리 트랙트", "urinary tract"],

  // 힐스 처방 라인 (영문-only SKU)
  ["k/d", "kd", "kidney care", "kidney", "신장"],
  ["i/d", "id", "digestive care", "digestive", "소화"],
  ["c/d", "cd", "multicare", "urinary care", "유리너리"],
  ["z/d", "zd", "skin food", "피부"],
  ["w/d", "wd", "weight management"],
  ["t/d", "td", "dental care", "덴탈"],
  ["a/d", "ad", "critical care"],
  ["gi biome", "gastrointestinal biome", "장건강"],
];

let aliasGroupCompacts: { compacts: string[]; group: readonly string[] }[] | null =
  null;

function getAliasIndex() {
  if (!aliasGroupCompacts) {
    aliasGroupCompacts = SEARCH_ALIAS_GROUPS.map((group) => ({
      group,
      compacts: group.map(compactForBilingual).filter(Boolean),
    }));
  }
  return aliasGroupCompacts;
}

/** 입력 문자열과 부분 일치하는 별칭 그룹의 모든 표기(원문) */
export function collectBilingualAliasTerms(text: unknown): string[] {
  const raw = safeString(text).trim();
  if (!raw) return [];

  const compact = compactForBilingual(raw);
  const found = new Set<string>([raw]);

  for (const { group, compacts } of getAliasIndex()) {
    const hit = compacts.some(
      (term) => term && (compact.includes(term) || term.includes(compact)),
    );
    if (hit) {
      for (const term of group) found.add(term);
    }
  }

  return [...found];
}

/** 검색 바늘(쿼리)이 카탈로그 blob에 포함되는지 — 별칭 확장 후 비교 */
export function bilingualNeedleMatchesHaystack(
  needle: unknown,
  haystackCompact: string,
): boolean {
  if (!haystackCompact) return false;

  const needles = collectBilingualAliasTerms(needle)
    .map(compactForBilingual)
    .filter(Boolean);

  return needles.some((n) => haystackCompact.includes(n));
}

/** brand · name 등 필드에 대한 검색용 별칭 문자열 */
export function bilingualFieldSearchTerms(
  ...fields: (unknown | null | undefined)[]
): string[] {
  const out = new Set<string>();
  for (const field of fields) {
    for (const term of collectBilingualAliasTerms(field)) {
      if (term.trim()) out.add(term);
    }
  }
  return [...out];
}
