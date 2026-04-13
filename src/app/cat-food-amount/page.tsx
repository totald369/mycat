import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/seo/SeoLandingPage";
import { buildSeoMetadata, getSeoLandingPage } from "@/lib/seoLandingPages";

const PAGE_PATH = "/cat-food-amount";

export const metadata: Metadata = buildSeoMetadata(PAGE_PATH);

export default function CatFoodAmountPage() {
  return <SeoLandingPage page={getSeoLandingPage(PAGE_PATH)} />;
}
