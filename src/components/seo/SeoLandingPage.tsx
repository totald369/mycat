import Link from "next/link";
import { SEO_LANDING_PAGES, type SeoLandingPageData } from "@/lib/seoLandingPages";

type Props = {
  page: SeoLandingPageData;
};

export function SeoLandingPage({ page }: Props) {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12 text-[#171717]">
      <article className="space-y-10">
        <header className="space-y-4">
          <h1 className="text-3xl font-bold leading-tight">{page.h1}</h1>
          <p className="text-base leading-7 text-[#333]">{page.description}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/step1"
              className="rounded-lg bg-[#f8620c] px-4 py-2 text-sm font-semibold text-white"
            >
              메인 계산기 바로가기
            </Link>
            <Link
              href="/"
              className="rounded-lg border border-[#dedee0] bg-white px-4 py-2 text-sm font-semibold text-[#171717]"
            >
              홈으로 이동
            </Link>
          </div>
        </header>

        {page.sections.map((section) => (
          <section key={section.heading} className="space-y-4">
            <h2 className="text-2xl font-semibold leading-tight">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-base leading-8 text-[#333]">
                {paragraph}
              </p>
            ))}
          </section>
        ))}

        <section className="space-y-4 rounded-2xl bg-[#f8f5f2] p-6">
          <h2 className="text-2xl font-semibold leading-tight">연관 급여량 가이드</h2>
          <p className="text-base leading-7 text-[#333]">
            아래 페이지를 함께 확인하면 고양이 하루 사료 양과 칼로리 계산을 더
            정확하게 이해할 수 있습니다.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {SEO_LANDING_PAGES.filter((item) => item.path !== page.path).map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className="block rounded-lg border border-[#dedee0] bg-white px-3 py-2 text-sm font-medium text-[#171717] hover:bg-[#fff7f2]"
                >
                  {item.h1}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </main>
  );
}
