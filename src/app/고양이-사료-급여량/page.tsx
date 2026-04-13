import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/seo/SeoLandingPage";
import { buildSeoMetadata, getSeoLandingPage } from "@/lib/seoLandingPages";

const PAGE_PATH = "/고양이-사료-급여량";

export const metadata: Metadata = buildSeoMetadata(PAGE_PATH);

export default function KoreanCatFoodAmountPage() {
  return <SeoLandingPage page={getSeoLandingPage(PAGE_PATH)} />;
}
