/** SEO 내부 링크 — 페이지 간 자연스러운 연결 */
export const SEO_INTERNAL_LINKS = [
  { href: "/", label: "고양이 급여량 계산기" },
  { href: "/step1", label: "급여량 계산하기" },
  { href: "/feed-find", label: "사료 찾기" },
  { href: "/foods", label: "사료 목록" },
  { href: "/feeding-guide", label: "급여 가이드" },
  { href: "/calorie-guide", label: "칼로리 가이드" },
  { href: "/고양이-4kg-사료량", label: "4kg 고양이 사료량" },
  { href: "/고양이-5kg-사료량", label: "5kg 고양이 사료량" },
  { href: "/중성화-고양이-사료량", label: "중성화 고양이 사료량" },
  { href: "/고양이-간식-칼로리", label: "고양이 간식 칼로리" },
  { href: "/고양이-건식-습식-급여량", label: "건식·습식 급여량" },
  { href: "/고양이-사료-바꿀때-급여량", label: "사료 바꿀 때 급여량" },
] as const;

export type SeoInternalLink = {
  href: string;
  label: string;
};

/** 현재 경로를 제외한 관련 링크 (최대 개수 제한) */
export function relatedSeoLinks(
  currentPath: string,
  limit = 8,
): SeoInternalLink[] {
  return SEO_INTERNAL_LINKS.filter((link) => link.href !== currentPath).slice(
    0,
    limit,
  );
}
