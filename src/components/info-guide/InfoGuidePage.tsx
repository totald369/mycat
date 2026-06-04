import Link from "next/link";

import { WizardHeader } from "@/components/design/WizardHeader";
import { SiteFooter } from "@/components/design/SiteFooter";
import { wizardHeaderOffsetClass } from "@/components/design/wizardLayoutClasses";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoFaqSection } from "@/components/seo/SeoFaqSection";
import {
  INFO_GUIDE_INTERNAL_LINKS,
  type InfoGuidePageData,
} from "@/lib/infoGuidePages";
import { buildArticleJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo";

type Props = {
  page: InfoGuidePageData;
};

function GuideSectionBlock({
  section,
}: {
  section: InfoGuidePageData["sections"][number];
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold leading-snug text-[#171717]">
        {section.heading}
      </h2>
      {section.paragraphs?.map((paragraph) => (
        <p
          key={paragraph.slice(0, 48)}
          className="text-sm leading-relaxed text-[#555]"
        >
          {paragraph}
        </p>
      ))}
      {section.list && section.list.length > 0 ? (
        <ul className="space-y-2 rounded-xl bg-[#f8f5f2] p-4">
          {section.list.map((item) => (
            <li
              key={item.slice(0, 48)}
              className="flex gap-2 text-sm leading-relaxed text-[#555]"
            >
              <span
                className="mt-2 size-1.5 shrink-0 rounded-full bg-[#f8620c]"
                aria-hidden
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {section.formula ? (
        <p className="rounded-xl border border-[#eee] bg-white px-4 py-3 text-center text-sm font-semibold leading-relaxed text-[#171717]">
          {section.formula}
        </p>
      ) : null}
      {section.note ? (
        <p className="rounded-xl bg-[#fff7f2] px-4 py-3 text-sm leading-relaxed text-[#555]">
          {section.note}
        </p>
      ) : null}
    </section>
  );
}

export function InfoGuidePage({ page }: Props) {
  const relatedLinks = INFO_GUIDE_INTERNAL_LINKS.filter(
    (link) => link.href !== page.path,
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      buildArticleJsonLd({
        path: page.path,
        headline: page.h1,
        description: page.description,
      }),
      buildBreadcrumbJsonLd([
        { name: "홈", path: "/" },
        { name: page.h1, path: page.path },
      ]),
    ],
  };

  return (
    <>
      <JsonLd id={`info-guide-jsonld-${page.path.replace(/\//g, "-")}`} data={jsonLd} />
      <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[min(100%,375px)] flex-col bg-white">
        <WizardHeader />
        <article
          className={`flex min-h-0 flex-1 flex-col px-6 pb-[max(2rem,env(safe-area-inset-bottom))] ${wizardHeaderOffsetClass}`}
        >
          <header className="space-y-3">
            <h1 className="text-xl font-bold leading-tight text-[#171717]">
              {page.h1}
            </h1>
            <div className="space-y-2">
              {page.intro.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 48)}
                  className="text-sm leading-relaxed text-[#555]"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </header>

          <div className="mt-8 space-y-8">
            {page.sections.map((section) => (
              <GuideSectionBlock key={section.heading} section={section} />
            ))}
          </div>

          <section className="mt-10 space-y-3 rounded-2xl bg-[#f8f5f2] p-5">
            <h2 className="text-base font-semibold text-[#171717]">
              {page.cta.title}
            </h2>
            <p className="text-sm leading-relaxed text-[#555]">{page.cta.text}</p>
            <Link
              href={page.cta.href}
              prefetch={false}
              className="mt-1 flex h-14 w-full items-center justify-center rounded-xl bg-[#f8620c] text-base font-semibold text-white active:opacity-90"
            >
              {page.cta.buttonLabel}
            </Link>
          </section>

          {page.faqs && page.faqs.length > 0 ? (
            <SeoFaqSection faqs={page.faqs} className="mt-8" />
          ) : null}

          <section
            className="mt-8 space-y-3"
            aria-labelledby={`related-links-${page.path.replace(/\//g, "-")}`}
          >
            <h2
              id={`related-links-${page.path.replace(/\//g, "-")}`}
              className="text-base font-semibold text-[#171717]"
            >
              함께 보면 좋은 글
            </h2>
            <ul className="grid gap-2">
              {relatedLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    prefetch={false}
                    className="block rounded-xl border border-[#eee] bg-white px-4 py-3 text-sm font-medium text-[#171717] active:bg-[#f5f1ed]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <SiteFooter className="mt-10" />
        </article>
      </main>
    </>
  );
}
