import Link from "next/link";
import { SiteFooter } from "@/components/design/SiteFooter";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoFaqSection } from "@/components/seo/SeoFaqSection";
import {
  SEO_LANDING_PAGES,
  type SeoLandingPageData,
} from "@/lib/seoLandingPages";
import { buildLandingJsonLdGraph } from "@/lib/seo";

type Props = {
  page: SeoLandingPageData;
};

export function SeoLandingPage({ page }: Props) {
  const related = SEO_LANDING_PAGES.filter((item) => item.path !== page.path);

  return (
    <>
      <JsonLd
        id={`landing-jsonld-${page.path.replace(/\//g, "-")}`}
        data={buildLandingJsonLdGraph({
          path: page.path,
          headline: page.h1,
          description: page.description,
          faqs: page.faqs,
        })}
      />
      <main className="mx-auto w-full min-w-0 max-w-3xl px-4 py-10 text-[#171717] min-[360px]:px-6 min-[360px]:py-12">
        <nav aria-label="breadcrumb" className="mb-6 text-sm text-[#666]">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/" prefetch={false} className="hover:text-[#f8620c]">
                홈
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-medium text-[#171717]">
              {page.h1}
            </li>
          </ol>
        </nav>

        <article className="space-y-12">
          <header className="space-y-4">
            <h1 className="text-2xl font-bold leading-tight min-[360px]:text-3xl">
              {page.h1}
            </h1>
            <p className="text-base leading-7 text-[#333]">{page.description}</p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/step1"
                prefetch={false}
                className="rounded-lg bg-[#f8620c] px-4 py-2.5 text-sm font-semibold text-white"
              >
                고양이 급여량 계산기 시작
              </Link>
              <Link
                href="/"
                prefetch={false}
                className="rounded-lg border border-[#dedee0] bg-white px-4 py-2.5 text-sm font-semibold text-[#171717]"
              >
                홈으로 이동
              </Link>
            </div>
          </header>

          {page.sections.map((section) => (
            <section key={section.heading} className="space-y-4">
              <h2 className="text-xl font-semibold leading-tight min-[360px]:text-2xl">
                {section.heading}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 48)}
                  className="text-base leading-8 text-[#333]"
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}

          <SeoFaqSection faqs={page.faqs} />

          <section
            className="space-y-4 rounded-2xl bg-[#f8f5f2] p-5 min-[360px]:p-6"
            aria-labelledby="related-guides-heading"
          >
            <h2
              id="related-guides-heading"
              className="text-xl font-semibold leading-tight min-[360px]:text-2xl"
            >
              연관 급여량 가이드
            </h2>
            <p className="text-base leading-7 text-[#333]">
              아래 페이지를 함께 확인하면 고양이 하루 사료량과 칼로리 계산을 더
              정확하게 이해할 수 있습니다.
            </p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {related.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    prefetch={false}
                    className="block rounded-lg border border-[#dedee0] bg-white px-3 py-2.5 text-sm font-medium text-[#171717] hover:bg-[#fff7f2]"
                  >
                    {item.h1}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </article>
        <SiteFooter className="mt-12 max-w-none" />
      </main>
    </>
  );
}
