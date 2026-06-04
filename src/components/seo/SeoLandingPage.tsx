import Link from "next/link";
import { SiteFooter } from "@/components/design/SiteFooter";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoFaqSection } from "@/components/seo/SeoFaqSection";
import { SeoInternalLinksSection } from "@/components/seo/SeoInternalLinksSection";
import { type SeoLandingPageData } from "@/lib/seoLandingPages";
import { buildLandingJsonLdGraph } from "@/lib/seo";

type Props = {
  page: SeoLandingPageData;
};

export function SeoLandingPage({ page }: Props) {
  const guideHref =
    page.path.includes("칼로리") || page.path.includes("간식")
      ? "/calorie-guide"
      : "/feeding-guide";
  const guideLabel =
    guideHref === "/calorie-guide" ? "칼로리 가이드" : "급여 가이드";

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
                href={guideHref}
                prefetch={false}
                className="rounded-lg border border-[#dedee0] bg-white px-4 py-2.5 text-sm font-semibold text-[#171717]"
              >
                {guideLabel} 보기
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

          <SeoInternalLinksSection
            currentPath={page.path}
            title="함께 보면 좋은 글"
            className="rounded-2xl bg-[#f8f5f2] p-5 min-[360px]:p-6"
          />
        </article>
        <SiteFooter className="mt-12 max-w-none" />
      </main>
    </>
  );
}
