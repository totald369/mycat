/**
 * CSV·DB에 적힌 표기와 달라도 검색이 되도록, 흔한 동음·유사 표기를 하나로 맞춤.
 * (예: Royal — 「로열」「로얄」→「로얄」 / Fancy Feast — 「펜시」「팬시」→「팬시」)
 */
export function canonicalizeKoreanSearchSpelling(input: string): string {
  let s = input;
  for (const { pattern, to } of KO_SEARCH_SPELLING_ALIASES) {
    s = s.replace(pattern, to);
  }
  return s;
}

/** 패턴 → CSV 등에 맞춘 대표 표기 (검색어·카탈로그 문자열 양쪽에 동일 적용) */
const KO_SEARCH_SPELLING_ALIASES: readonly {
  pattern: RegExp;
  to: string;
}[] = [
  { pattern: /로열/g, to: "로얄" },
  { pattern: /로엘/g, to: "로얄" },
  { pattern: /펜시/g, to: "팬시" },
];
