import Image from "next/image";
import Link from "next/link";

/** 사료 찾기 페이지 타이틀 — Figma 306:12238 */
export function FeedFindSeoIntro() {
  return (
    <header className="flex w-full max-w-[min(327px,100%)] shrink-0 flex-col gap-2">
      <div className="flex items-center gap-1">
        <Image
          src="/icons/feed-find/title-cat.svg"
          alt=""
          width={50}
          height={50}
          className="size-[50px] shrink-0"
          unoptimized
        />
        <h1 className="text-[32px] font-bold leading-[1.2] text-[#111]">사료 찾기</h1>
      </div>
      <p className="text-base leading-[1.4] text-[#555]">
        사료마다 칼로리와 급여 기준량이 달라요.
        <br />
        사료를 검색해 급여량 계산에 활용해보세요.
      </p>
      <nav aria-label="관련 페이지" className="sr-only">
        {[
          { href: "/step1", label: "급여량 계산하기" },
          { href: "/feeding-guide", label: "급여 가이드" },
          { href: "/calorie-guide", label: "칼로리 가이드" },
          { href: "/고양이-건식-습식-급여량", label: "건식·습식 급여량" },
          { href: "/foods", label: "사료 목록" },
        ].map((link) => (
          <Link key={link.href} href={link.href} prefetch={false}>
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
