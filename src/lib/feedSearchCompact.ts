import { canonicalizeKoreanSearchSpelling } from "@/lib/koreanSearchNormalize";
import { safeString } from "@/lib/feedSafeValues";

const COMPACT_STRIP_RE = /[\s\-_/·.,'’+]+/gu;

/**
 * 검색 비교용 compact — 대·소문자·전각 영문(NFKC) 무시, 공백·구두점 제거.
 * 쿼리·카탈로그 blob 양쪽에 동일 적용.
 */
export function compactForSearch(value: unknown): string {
  const s = safeString(value);
  if (!s) return "";
  return canonicalizeKoreanSearchSpelling(s)
    .normalize("NFKC")
    .toLocaleLowerCase("en-US")
    .replace(COMPACT_STRIP_RE, "");
}
