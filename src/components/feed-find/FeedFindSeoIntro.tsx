import Link from "next/link";

/** 사료 찾기 페이지 SEO 인트로 — 검색 UI 위 텍스트 */
export function FeedFindSeoIntro() {
  return (
    <header className="shrink-0 space-y-3 px-4 pb-3 pt-1">
      <h1 className="text-xl font-bold leading-tight text-[#171717]">
        고양이 사료 찾기
      </h1>
      <p className="text-sm leading-relaxed text-[#555]">
        사료마다 100g당 칼로리와 급여 기준량이 달라요. 우리 아이가 먹는 사료
        정보를 확인하고, 급여량 계산에 활용해보세요.
      </p>
      <nav aria-label="관련 페이지" className="flex flex-wrap gap-2 pt-1">
        {[
          { href: "/step1", label: "급여량 계산하기" },
          { href: "/feeding-guide", label: "급여 가이드" },
          { href: "/calorie-guide", label: "칼로리 가이드" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            prefetch={false}
            className="rounded-lg border border-[#eee] bg-[#f8f5f2] px-3 py-1.5 text-xs font-medium text-[#333]"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
