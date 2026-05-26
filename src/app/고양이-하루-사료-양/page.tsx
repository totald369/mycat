import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/seo/SeoLandingPage";
import { buildSeoMetadata, getSeoLandingPage } from "@/lib/seoLandingPages";

const PAGE_PATH = "/고양이-하루-사료-양";

export const metadata: Metadata = buildSeoMetadata(PAGE_PATH);

export default function CatDailyFoodAmountKoPage() {
  return <SeoLandingPage page={getSeoLandingPage(PAGE_PATH)} />;
}
