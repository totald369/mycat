import { SiteFooter } from "@/components/design/SiteFooter";
import { HomeSeoGuideSection } from "@/components/seo/HomeSeoGuideSection";
import { SeoFaqSection } from "@/components/seo/SeoFaqSection";
import { HOME_FAQ } from "@/lib/seo";

/** 홈 하단 SEO·FAQ */
export function HomePageBelowFold() {
  return (
    <div className="relative w-full px-4 pb-[calc(11rem+env(safe-area-inset-bottom,0px))] pt-2 min-[360px]:px-6">
      <HomeSeoGuideSection />
      <SeoFaqSection
        faqs={HOME_FAQ}
        className="mx-auto mt-12 w-full max-w-[min(327px,100%)]"
      />
      <SiteFooter className="mt-12" />
    </div>
  );
}
