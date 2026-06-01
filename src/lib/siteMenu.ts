export type SiteMenuItem = {
  href: string;
  label: string;
};

/** 피그마 Menu Layer(315:54) — 전역 내비게이션 */
export const SITE_MENU_ITEMS: readonly SiteMenuItem[] = [
  { href: "/step1", label: "급여량 계산하기" },
  { href: "/feed-find", label: "사료 찾기" },
  { href: "/feeding-guide", label: "급여 가이드" },
  { href: "/calorie-guide", label: "칼로리 가이드" },
] as const;

const CALCULATOR_PATHS = new Set(["/step1", "/step2", "/step3", "/result"]);

/** 메뉴 레이어에서 현재 페이지에 해당하는 항목인지 판별 */
export function isSiteMenuItemActive(
  pathname: string,
  item: SiteMenuItem,
): boolean {
  if (pathname === item.href) return true;

  if (item.href === "/step1") {
    return CALCULATOR_PATHS.has(pathname);
  }

  if (item.href === "/feed-find") {
    return pathname === "/foods" || pathname.startsWith("/foods/");
  }

  return false;
}
