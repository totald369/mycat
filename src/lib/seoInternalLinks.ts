/** SEO 내부 링크 — 페이지 간 자연스러운 연결 */
export const SEO_INTERNAL_LINKS = [
  { href: "/", label: "고양이 급여량 계산기" },
  { href: "/step1", label: "급여량 계산하기" },
  { href: "/foods", label: "사료 목록" },
  { href: "/feed-find", label: "사료 찾기" },
  { href: "/feeding-guide", label: "급여 가이드" },
  { href: "/calorie-guide", label: "칼로리 가이드" },
] as const;

export type SeoInternalLink = {
  href: string;
  label: string;
};

/** 현재 경로를 제외한 관련 링크 */
export function relatedSeoLinks(currentPath: string): SeoInternalLink[] {
  return SEO_INTERNAL_LINKS.filter((link) => link.href !== currentPath);
}
