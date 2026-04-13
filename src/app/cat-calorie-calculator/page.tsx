import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/seo/SeoLandingPage";
import { buildSeoMetadata, getSeoLandingPage } from "@/lib/seoLandingPages";

const PAGE_PATH = "/cat-calorie-calculator";

export const metadata: Metadata = buildSeoMetadata(PAGE_PATH);

export default function CatCalorieCalculatorPage() {
  return <SeoLandingPage page={getSeoLandingPage(PAGE_PATH)} />;
}
