import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/seo/SeoLandingPage";
import { buildSeoMetadata, getSeoLandingPage } from "@/lib/seoLandingPages";

const PAGE_PATH = "/중성화-고양이-사료량";

export const metadata: Metadata = buildSeoMetadata(PAGE_PATH);

export default function NeuteredCatFoodAmountKoPage() {
  return <SeoLandingPage page={getSeoLandingPage(PAGE_PATH)} />;
}
