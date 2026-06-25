import Image from "next/image";
import Link from "next/link";

/** 사료 찾기 페이지 타이틀 — Figma List_title.svg */
export function FeedFindSeoIntro() {
  return (
    <header className="flex w-full max-w-[min(327px,100%)] shrink-0 flex-col gap-2">
      <h1 className="m-0">
        <Image
          src="/icons/List_title.svg"
          alt="사료 찾기"
          width={157}
          height={50}
          className="h-[50px] w-auto max-w-full"
          unoptimized
          priority
        />
      </h1>
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
